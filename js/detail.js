// Hämta ID för maträtten från URL
let params = new URLSearchParams(document.location.search); //
let id = params.get("id");
const elMealDetail = document.getElementById("meal-detail");
const elFavoriteRecipes = document.getElementById("favorite-recipes");
const elRelateRecipes = document.getElementById("relate-recipes");

// Denna kod skickar en API-förfrågan för att hämta detaljerna om en maträtt och visar dem på sidan, samtidigt som den kallar på funktionen för att visa relaterade maträtter.

// Skicka API-förfrågan för att hämta detaljer om maträtten
fetch(`${BASE_URL_API}lookup.php?i=${id}`)
  .then((response) => response.json())
  .then((data) => {
    if (data) {
      const element = data.meals[0];
      // Hantera och visa ingredienser
      let ingredients = "";
      for (let i = 1; i <= 20; i++) {
        // Iterera över 20 egenskaper för ingredienser (strIngredient1, strIngredient2, ...) och mått (strMeasure1, strMeasure2, ...).
        const ingredientProp = `strIngredient${i}`;
        const ingredientValue = element[ingredientProp];
        if (ingredientValue) {
          // Om ingrediensen existerar (ingredientValue är inte null eller tom), lägg till den i ingredienslistan med mått (strMeasure${i}).
          const measureValue = element[`strMeasure${i}`]; // Giá trị định lượng
          ingredients += `
          <div class="container">
          <table class="table">
          <tr>
            <td>${ingredientValue}</td>
            <td>${measureValue}</td>
          </tr>
          </table>
          </div>
          `;
        }
      }

      elPageTitle.textContent = element.strMeal;

      const html = `
      <div class="meal-detail m-5">
        <div class="d-flex align-items-center">
          <h1>${element.strMeal}</h1>
          <span class="favorite-icon m-3" data-id="${element.idMeal}">
            ${
              FAVORITE_LIST_RECIPES.includes(element.idMeal)
                ? LIKED_HEART
                : UNLIKED_HEART
            }
          </span>
        </div>
        <div class="d-flex justify-content-between">
          <div class="meal-info">
            <h4 class="fst-italic">Category: <a href="index.html?c=${
              element.strCategory
            }">${element.strCategory}</a></h4>
            <h4 class="fst-italic mt-2">Cuisine: ${element.strArea}</h4>
            <img src="${element.strMealThumb}" alt="${
        element.strMeal
      }" width="500px" class="img-fluid rounded" />
          </div>
          <div class="ingredient-block">
            <h2>Ingredients:</h2>
            <ul>${ingredients}</ul>
          </div>
        </div>
        <h2>Instructions:</h2>
        <p>
        ${element.strInstructions}</p>`;
      elMealDetail.innerHTML = html;
      // Hämta den aktuella maträttens kategori för att visa relaterade maträtter
      const currentCategory = element.strCategory;
      displayRelatedRecipes(currentCategory, element.idMeal); // Gọi hàm hiển thị món ăn liên quan
    }
  });

// EVent Favorite
elMealDetail.addEventListener("click", (e) => {
  const id = e.target.dataset.id; // Lấy ID món ăn
  const iconElement = e.target; // Biểu tượng trái tim được click

  // Kiểm tra trạng thái yêu thích
  if (FAVORITE_LIST_RECIPES.includes(id)) {
    // Nếu đã có trong danh sách, xóa khỏi danh sách
    FAVORITE_LIST_RECIPES = FAVORITE_LIST_RECIPES.filter(
      (itemId) => itemId !== id
    );
    iconElement.innerHTML = UNLIKED_HEART; // Đổi biểu tượng thành chưa thích
  } else {
    // Nếu chưa có, thêm vào danh sách
    FAVORITE_LIST_RECIPES.push(id);
    iconElement.innerHTML = LIKED_HEART; // Đổi biểu tượng thành đã thích
  }

  // Cập nhật danh sách yêu thích vào localStorage
  localStorage.setItem(
    "FAVORITE_LIST_RECIPES",
    JSON.stringify(FAVORITE_LIST_RECIPES)
  );
  elCount.textContent = FAVORITE_LIST_RECIPES.length;
});

// Skapa en funktion för att visa en lista på upp till 4 relaterade maträtter baserat på kategorin för den aktuella maträtten.
async function displayRelatedRecipes(category, currentRecipeId) {
  const response = await fetch(`${BASE_URL_API}filter.php?c=${category}`);
  const data = await response.json();
  const relatedRecipes = data.meals;
  const filteredRecipes = relatedRecipes.filter(
    (recipe) => recipe.idMeal !== currentRecipeId
  );

  // Välj slumpmässigt upp till 4 maträtter
  const randomRelatedRecipes = [];
  for (let i = 0; i < 4 && filteredRecipes.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
    randomRelatedRecipes.push(filteredRecipes[randomIndex]);
    filteredRecipes.splice(randomIndex, 1);
  }
  console.log(randomRelatedRecipes);

  elRelateRecipes.innerHTML = "";
  let recipeHTML = "";
  randomRelatedRecipes.forEach((recipe) => {
    recipeHTML += `
    <div class="col-3">
      <div class="recipe mb-3">
        <div class="recipe-thumb-wrapper">
          <a class="text-decoration-none" href="detail.html?id=${recipe.idMeal}">
            <img src="${recipe.strMealThumb}" alt="" class="recipe-thumb img-fluid" />
          </a>
        </div>
        <h3 class="recipe-name">
          <a class="text-decoration-none" href="detail.html?id=${recipe.idMeal}">
              ${recipe.strMeal}
          </a>
        </h3>
      </div>
    </div>
    `;
  });
  elRelateRecipes.innerHTML = recipeHTML;
}
