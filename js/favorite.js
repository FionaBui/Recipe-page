// DEFINE
const elFavoriteRecipes = document.getElementById("favorite-recipes");
elPageTitle.textContent = "Favorite Recipes";

// Händelsehantering för favoritknappen
elFavoriteRecipes.addEventListener("click", (e) => {
  // Kontrollera om det klickade elementet är en favoritikon
  const el = e.target;
  if (el.classList.contains("favorite-icon")) {
    const id = el.dataset.id; // Hämta recept-ID från data-attributet
    FAVORITE_LIST_RECIPES = FAVORITE_LIST_RECIPES.filter(
      (itemId) => itemId !== id
    );
    localStorage.setItem(
      "FAVORITE_LIST_RECIPES",
      JSON.stringify(FAVORITE_LIST_RECIPES)
    );
    el.closest(".recipe-col").remove();
    elCount.textContent = FAVORITE_LIST_RECIPES.length;
    showToast("Removed from favorites!");
  }
});

// FUNCTIONS
// Funktion för att hämta receptinformation baserat på ID
async function fetchRecipeById(id) {
  const response = await fetch(`${BASE_URL_API}lookup.php?i=${id}`);
  const data = await response.json();
  return data.meals[0];
}
// Funktion för att visa listan över favoritrecept
async function displayFavoriteList() {
  if (FAVORITE_LIST_RECIPES.length === 0) {
    elFavoriteRecipes.innerHTML = `
        <div class="col-12 text-center>
          <p class="text-muted">You haven't added any favorite recipes yet!</p>
        </div>
        `;
    return;
  }
  let html = "";
  for (const id of FAVORITE_LIST_RECIPES) {
    const element = await fetchRecipeById(id);
    html += `
    <div class="col-3 recipe-col">
        <div class="recipe mb-3">
          <div class="recipe-thumb-wrapper">
            <a class="text-decoration-none" href="detail.html?id=${element.idMeal}">
              <img src="${element.strMealThumb}" alt="" class="recipe-thumb img-fluid" />
            </a>
            <span class="favorite-icon" data-id="${element.idMeal}">
                ${LIKED_HEART}
            </span>
          </div>
          <h3 class="recipe-name">
            <a class="text-decoration-none" href="detail.html?id=${element.idMeal}">
              ${element.strMeal}
            </a>
          </h3>
        </div>
      </div>
    `;
  }
  elFavoriteRecipes.innerHTML = html;
}
displayFavoriteList();
