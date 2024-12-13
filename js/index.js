// DEFINE
const elRecipeList = document.getElementById("recipe-list");
const elFilterCategory = document.getElementById("filter-category");
const elFilterArea = document.getElementById("filter-area");
const elFilterIngredients = document.getElementById("filter-ingredient");
const elBtnFilter = document.getElementById("btn-filter");
const elBtnClear = document.getElementById("btn-clear");
const elSearchInput = document.getElementById("search-input");
const elBtnSearch = document.getElementById("btn-search");
const elBtnLoadMore = document.getElementById("btn-load-more");
const elOptionIngredients = document.getElementById(
  "dataListOptionsIngredients"
);
const elFilterSidebar = document.querySelector(".filter-sidebar");

// Ändra sidans titel
elPageTitle.textContent = "Cook & Share - Homepage";

// Variabler för att hantera tillstånd
let params = new URLSearchParams(document.location.search); // Hämta parametrar från URL
let searchValue = (params.get("q") || "").trim(); // Sökvärde från URL
let filterAreaValue = (params.get("a") || "").trim(); // Områdesvärde från URL
let filterCategoryValue = (params.get("c") || "").trim(); // Kategorivärde från URL
let filterIngredientValue = (params.get("i") || "").trim();
let allMeals = []; // Array för alla recept
let allMealsRender = []; // Array för recept som visas för tillfället

// Sidnumrering
let page = 1;
const PAGE_RANGE = 9;
let start = PAGE_RANGE * (page - 1);
let end = start + PAGE_RANGE;

// INIT
init();

// EVENTS
// Händelse för sökknappen
elBtnSearch.addEventListener("click", (event) => {
  page = 1; // Återställ till första sidan vid ny sökning
  elFilterArea.value = ""; // Rensa områdesfilter
  elFilterCategory.value = ""; // Rensa kategorifilter
  elFilterIngredients.value = ""; // Rensa ingrediensfilter

  searchValue = elSearchInput.value; // Hämta värde från sökfältet
  if (searchValue) {
    updateHistory(`q=${searchValue}`);
    fetch(`${BASE_URL_API}search.php?s=${searchValue}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.meals) {
          // Om rätter hittades
          allMealsRender = [...data.meals]; // Uppdatera listan med recept som ska visas
          displayMeals(allMealsRender);
        } else {
          // Om inga rätter hittades
          elRecipeList.innerHTML = `
            <div class="col-12 text-center">
              <p class="text-muted">No results found for "${searchValue}".</p>
            </div>
          `;
          elBtnLoadMore.style.display = "none"; // Dölj knappen för att ladda fler om inget resultat hittades
        }
      });
  }
});

// Händelse för filterknappen
elBtnFilter.addEventListener("click", async (event) => {
  elSearchInput.value = ""; // När du använder filter kommer söksektionen att vara ren
  event.preventDefault(); // Förhindra standardbeteende, som formulärinlämning
  page = 1;
  filterAreaValue = elFilterArea.value;
  filterCategoryValue = elFilterCategory.value;
  filterIngredientValue = elFilterIngredients.value.trim().toLowerCase();

  let queryString = []; // Bygg upp en sträng för URL-frågor

  allMealsRender = [...allMeals];
  if (filterAreaValue) {
    allMealsRender = allMealsRender.filter(
      (el) => el.strArea === filterAreaValue
    );
    queryString.push(`a=${filterAreaValue}`);
  }
  if (filterCategoryValue) {
    allMealsRender = allMealsRender.filter(
      (el) => el.strCategory === filterCategoryValue
    );
    queryString.push(`c=${filterCategoryValue}`);
  }

  if (filterIngredientValue) {
    allMealsRender = allMealsRender.filter((el) => {
      let check = false; // Kontrollera om receptet innehåller ingrediensen
      for (let i = 1; i <= 20; i++) {
        const ingredientProp = `strIngredient${i}`;
        const ingredientPropValue = el[ingredientProp];
        if (
          ingredientPropValue &&
          ingredientPropValue.toLowerCase().includes(filterIngredientValue)
        ) {
          check = true;
          break;
        }
      }
      return check;
    });
    queryString.push(`i=${filterIngredientValue}`);
  }
  // Sammansätt frågorna till en sträng
  queryString = queryString.join("&");
  updateHistory(queryString);

  if (allMealsRender.length === 0) {
    elRecipeList.innerHTML = `
            <div class="col-12 text-center">
              <p class="text-muted">No results found.</p>
            </div>
          `;
  } else {
    displayMeals(allMealsRender);
  }
});

// Rensa filter: Funktionen nollställer alla filterfält och visar hela listan med recept.
elBtnClear.addEventListener("click", (event) => {
  event.preventDefault();
  elFilterCategory.value = "";
  elFilterArea.value = "";
  elFilterIngredients.value = "";
  allMealsRender = [...allMeals];
  displayMeals(allMealsRender);
  updateHistory();
});

// Ladda fler recept: Funktionen visar fler recept från listan baserat på sidnummer.
elBtnLoadMore.addEventListener("click", () => {
  page++;
  displayMeals(allMealsRender);
});

// Favorite - event delegate
elRecipeList.addEventListener("click", (e) => {
  const el = e.target;
  console.log(el);

  if (el.classList.contains("favorite-icon")) {
    const id = el.dataset.id;
    if (FAVORITE_LIST_RECIPES.includes(id)) {
      FAVORITE_LIST_RECIPES = FAVORITE_LIST_RECIPES.filter(
        (itemId) => itemId !== id
      );
      el.innerHTML = UNLIKED_HEART;
      showToast("Removed from favorites!");
    } else {
      FAVORITE_LIST_RECIPES.push(id);
      el.innerHTML = LIKED_HEART;
      showToast("Added to favorites!");
    }
    localStorage.setItem(
      "FAVORITE_LIST_RECIPES",
      JSON.stringify(FAVORITE_LIST_RECIPES)
    );
    elCount.textContent = FAVORITE_LIST_RECIPES.length;
  }
});

// FUNCTIONS
// Funktionen visar en delmängd av recepten beroende på sidnummer och sidstorlek.
function displayMeals(meals) {
  elBtnLoadMore.style.display = "unset";
  let start = PAGE_RANGE * (page - 1);
  let end = start + PAGE_RANGE;
  const arrRender = meals.slice(start, end);
  const arrRenderLength = arrRender.length;
  // Använd if för att kontrollera om alla objekt visas eller att antalet objekt som ska laddas är mindre än 9, då döljs knappen loadmore.
  if (arrRenderLength === meals.length || arrRenderLength < PAGE_RANGE) {
    elBtnLoadMore.style.display = "none";
  }
  let html = "";
  arrRender.forEach((element) => {
    const heartIcon = FAVORITE_LIST_RECIPES.includes(element.idMeal)
      ? LIKED_HEART
      : UNLIKED_HEART;
    html += `
      <div class="col-3">
        <div class="recipe mb-3">
          <div class="recipe-thumb-wrapper">
            <a class="text-decoration-none" href="detail.html?id=${element.idMeal}">
              <img src="${element.strMealThumb}" alt="" class="recipe-thumb img-fluid" />
            </a>
            <span class="favorite-icon" data-id="${element.idMeal}">
                ${heartIcon}
            </span>
          </div>
          <h3 class="recipe-name">
            <a class="text-decoration-none" href="detail.html?id=${element.idMeal}">
              ${element.strMeal}
            </a>
          </h3>
        </div>
      </div>`;
  });
  // Om detta är den första sidan, rensa allt befintligt innehåll i elRecipeList för att starta en ny visning.
  if (page === 1) {
    elRecipeList.innerHTML = "";
  }

  elRecipeList.innerHTML += html;
}

// Funktionen för att uppdatera URL-adressen utan att ladda om sidan
function updateHistory(queryStr = "") {
  history.pushState({}, "", `index.html?${queryStr}`);
}

// Funktionen för att hämta alla recept baserat på alfabetet

async function fetchAllMeals() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split(""); // Skapar en array med alla bokstäver i alfabetet
  for (let letter of alphabet) {
    await fetch(`${BASE_URL_API}search.php?f=${letter}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.meals) {
          // Lägg bara till om det finns data
          allMeals = allMeals.concat(data.meals); // Lägg till en lista med rätter till array
        }
      });
  }
  console.log(allMeals);
  elFilterSidebar.classList.remove("pe-none"); // Aktiverar filterpanelen när laddningen är klar
  allMealsRender = [...allMeals]; // Kopierar hela listan för renderering
  // Kontrollera om sökning eller filter har använts tidigare
  if (searchValue) {
    elSearchInput.value = searchValue;
    elBtnSearch.click(); // Kör sökknappen automatiskt
  } else if (filterAreaValue || filterIngredientValue || filterCategoryValue) {
    elFilterArea.value = filterAreaValue;
    elFilterCategory.value = filterCategoryValue;
    elFilterIngredients.value = filterIngredientValue;
    elBtnFilter.click(); // Kör filterknappen automatiskt
  } else {
    displayMeals(allMeals);
  }
  const categoryData = getCategoryData(allMeals); // Hämtar kategoridata för diagrammet
  displayCategoryChart(categoryData);
}

// Funktionen för att rendera filtermenyn
async function renderFilter() {
  await fetch(`${BASE_URL_API}list.php?a=list`)
    .then((response) => response.json())
    .then((data) => {
      let mealArea = '<option value="">Select Area</option>';
      let option = document.createElement("option");
      option.textContent = "Select Area";
      option.value = "";
      elFilterArea.appendChild(option);
      data.meals.forEach((element) => {
        let option = document.createElement("option");
        option.textContent = element.strArea;
        option.value = element.strArea;
        elFilterArea.appendChild(option);
      });
    });

  await fetch(`${BASE_URL_API}list.php?c=list`)
    .then((response) => response.json())
    .then((data) => {
      let mealCategory = '<option value="">Select Category</option>';
      data.meals.forEach((element) => {
        mealCategory += `<option value="${element.strCategory}">${element.strCategory}</option>
        `;
      });
      elFilterCategory.innerHTML = mealCategory;
    });
  await fetch(`${BASE_URL_API}list.php?i=list`)
    .then((response) => response.json())
    .then((data) => {
      let mealIngredients = "";
      data.meals.forEach((element) => {
        mealIngredients += `<option value="${element.strIngredient}"></option>`;
      });
      elOptionIngredients.innerHTML = mealIngredients;
    });
}
// Funktionen för att räkna antalet recept per kategori
function getCategoryData(meals) {
  const categoryCount = {};
  meals.forEach((el) => {
    const key = el.strCategory;
    // Lấy tên area của món ăn
    if (categoryCount[key]) {
      categoryCount[key]++; // Ökar räkningen om kategorin redan finns
    } else {
      categoryCount[key] = 1;
      // Skapar ny kategori med räkning 1
    }
  });
  return categoryCount;
}

// Funktionen för att visa diagrammet
function displayCategoryChart(categoryData) {
  const elCategoryChart = document.getElementById("areaChart");
  const xValues = Object.keys(categoryData);
  const yValues = Object.values(categoryData);

  new Chart(elCategoryChart, {
    type: "pie",
    data: {
      datasets: [
        {
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
          data: yValues,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Food ratio by category",
        },
      },
    },
  });
}

async function init() {
  await renderFilter();
  await fetchAllMeals();
}
