// cities.js: Thực hiện các chức năng CRUD (Create, Read, Update, Delete) cho danh sách thành phố

// Đường dẫn API cơ sở
const BASE_CITY_URL_API = "https://avancera.app/cities/"; // API endpoint để thao tác dữ liệu thành phố

const elCityForm = document.getElementById("city-form");
const elCityNameInput = document.getElementById("city-name");
const elCityPopulationInput = document.getElementById("city-population");
const elCityList = document.getElementById("city-list");
const elBtnSave = document.getElementById("btn-save");
const elBtnCancel = document.getElementById("btn-cancel");
// Biến lưu trữ trạng thái chỉnh sửa
let idEdit = null; // Lưu ID của thành phố đang chỉnh sửa (null khi tạo mới)

function getCategoryData(meals) {
  const categoryCount = {};
  meals.forEach((el) => {
    const key = el.strCategory;
    if (categoryCount[key]) {
      categoryCount[key]++;
    } else {
      categoryCount[key] = 1;
    }
  });
  return categoryCount;
}

function displayCategoryChart(categoryData) {
  const elCategoryChart = document.getElementById("areaChart");
  const xValues = Object.keys(categoryData);
  const yValues = Object.values(categoryData);

  new Chart(elCategoryChart, {
    type: "pie",
    data: {
      labels: xValues,
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

async function fetchMealsForChart() {
  const response = await fetch(`${BASE_URL_API}search.php?s=`); // Lấy tất cả món ăn
  const data = await response.json();
  const categoryData = getCategoryData(data.meals); // Chuẩn bị dữ liệu
  displayCategoryChart(categoryData); // Hiển thị biểu đồ
}

fetchMealsForChart();

document.addEventListener("DOMContentLoaded", () => {
  fetchMealsForChart();
});

// Hàm lấy danh sách các thành phố và hiển thị chúng
async function fetchCities() {
  const response = await fetch(BASE_CITY_URL_API); // Gửi yêu cầu GET đến API để lấy danh sách thành phố
  const data = await response.json(); // Chuyển đổi phản hồi JSON thành đối tượng JavaScript
  displayCityList(data); // Hiển thị danh sách thành phố lên bảng
  console.log(data);
}
fetchCities(); // Gọi hàm khi trang tải lần đầu

// Hàm hiển thị danh sách thành phố lên giao diện
function displayCityList(data) {
  elCityList.innerHTML = ""; //   Xóa nội dung cũ
  data.forEach((city) => {
    // Sử dụng forEach để duyệt qua tưngf thành phố trong data
    const row = document.createElement("tr"); // Tạo phần tử bảng mới thể hiện 1 hàng trong bảng
    row.innerHTML = ` 
    <td>${city.id}</td>
      <td>${city.name}</td>
      <td>${city.population}</td>
      <td>
        <button data-id="${city.id}" class="edit-btn btn btn-info">Edit</button>
        <button data-id="${city.id}" class="delete-btn btn btn-danger">Delete</button>
      </td>
    `;
    elCityList.appendChild(row); // Thêm hàng row vào phần tử bảng
  });
}

// Hàm xóa thành phố dựa vào ID
async function deleteCity(id) {
  await fetch(`${BASE_CITY_URL_API}${id}`, { method: "DELETE" }); // Gửi yêu cầu DELETE đến API với ID của thành phố

  fetchCities(); //Sau khi xóa, gọi lại fetchCities để cập nhật danh sách.
}

// Xử lý sự kiện click cho nút chỉnh sửa và xóa
elCityList.addEventListener("click", async (e) => {
  const el = e.target; // Lấy phần tử được click
  if (el.classList.contains("delete-btn")) {
    // Nếu là nút xóa
    const id = el.dataset.id;
    // Lấy ID từ thuộc tính data-id
    if (confirm("Are you sure delete?")) {
      // Hiển thị hộp thoại xác nhận
      deleteCity(id); // Gọi hàm xóa thành phố
    }
  }

  if (el.classList.contains("edit-btn")) {
    // Nếu là nút chỉnh sửa, thì phải lấy thông tin cũ để hiển thị lên ô input
    idEdit = el.dataset.id; // Lưu ID của thành phố mà muốn chỉnh sửa

    const response = await fetch(BASE_CITY_URL_API + idEdit); // Lấy thông tin chi tiết của thành phố từ API
    const data = await response.json();
    elCityNameInput.value = data.name; // Điền tên vào input
    elCityPopulationInput.value = data.population; // Điền dân số vào input
    elBtnSave.textContent = "Update"; // Thay đổi nút thành Update
  }
});

// Xử lý sự kiện submit form để thêm hoặc cập nhật thành phố
elCityForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Ngăn form reload lại trang
  // Get value from all inputs in FORM
  const nameInput = elCityNameInput.value.trim(); // Lấy và xóa khoảng trắng tên thành phố
  const populationInput = parseInt(elCityPopulationInput.value); // Lấy giá trị dân số và chuyển thành số nguyên

  //   Kiểm tra dữ liệu hợp lệ
  if (!nameInput || isNaN(populationInput)) {
    return;
  }
  // Tạo đối tượng dữ liệu thành phố
  const cityData = { name: nameInput, population: populationInput };

  //  Gửi yêu cầu POST đến API
  if (idEdit) {
    // Nếu đang chỉnh sửa
    cityData.id = idEdit; // Gắn ID vào đối tượng dữ liệu
    const response = await fetch(BASE_CITY_URL_API + idEdit, {
      body: JSON.stringify(cityData), // Chuyển dữ liệu thành chuỗi JSON
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT", // Gửi yêu cầu PUT để cập nhật dữ liệu
    });
  } else {
    // Nếu thêm muốn Gửi dữ liệu mới để thêm thành phố
    const response = await fetch(BASE_CITY_URL_API, {
      body: JSON.stringify(cityData),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    console.log(`city ${nameInput} population ${populationInput}`);
    if (!response.ok) {
      console.error(`Error: ${response.status}`);
      return;
    }
  }
  fetchCities(); // Cập nhật lại danh sách thành phố
  elBtnSave.textContent = "Save"; // Đặt lại nút thành Save
  idEdit = null; // Đặt trạng thái về null
  elCityForm.reset(); // Xóa dữ liệu trong form
});
// Xử lý nút hủy
elBtnCancel.addEventListener("click", () => {
  idEdit = null;
  elCityForm.reset();
  elBtnSave.textContent = "Save";
});

/*
fetchCities
fetchCity(id)
deleteCity(id)
createCity(data)
updateCity(data)
*/

// (4). Update: show old info + update info
//     3.1. Show old info: add event click button edit -> event delegate
//         - Get id -> dataset.id
//         - call api GET DETAIL: /cities/{id} -> object
//         - show info to inputs on FORM

//     3.2. Update Info: same event (3)
