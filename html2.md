# Gumbo DOM API Documentation

Легковесная DOM библиотека для Duktape 1.8.0 с поддержкой HTML парсинга через Gumbo.

## Установка и подключение

```javascript
var html = require('./html2');

```

## Основные методы

### `parse(htmlString)`

Парсит HTML строку и возвращает объект с документом и корневым элементом.

```javascript
var htmlContent = '<html><body><div id="test">Hello World</div></body></html>';
var doc = html.parse(htmlContent);

console.log(doc.document); // [document]
console.log(doc.root);     // <html>

```

**Возвращает:**

```javascript
{
  document: Node, // документ
  root: Node      // корневой элемент (<html>)
}

```

## Класс Node

### Свойства

#### `nodeType` (readonly)

Тип узла согласно DOM спецификации:

-   `1` - элемент
-   `3` - текстовый узел
-   `8` - комментарий
-   `9` - документ

```javascript
var div = doc.root.querySelector('div');
console.log(div.nodeType); // 1

```

#### `nodeName` (readonly)

Имя узла (в нижнем регистре для элементов).

```javascript
var div = doc.root.querySelector('div');
console.log(div.nodeName); // "div"

```

#### `tagName` (readonly)

Имя тега в верхнем регистре (только для элементов).

```javascript
var div = doc.root.querySelector('div');
console.log(div.tagName); // "DIV"

```

#### `textContent` (readonly)

Текстовое содержимое узла и всех его потомков.

```javascript
var html = '<div>Hello <span>World</span>!</div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.textContent); // "Hello World!"

```

#### `children` (readonly)

Массив дочерних элементов (только элементы, без текстовых узлов).

```javascript
var html = '<div><p>Text</p><!-- comment --><span>More</span></div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.children.length); // 2 (p и span)

```

#### `childNodes` (readonly)

Массив всех дочерних узлов (включая текстовые узлы и комментарии).

```javascript
var html = '<div><p>Text</p><!-- comment --><span>More</span></div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.childNodes.length); // больше 2 (включая пробелы)

```

#### `className` (readonly)

Значение атрибута `class`.

```javascript
var html = '<div class="container active">Content</div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.className); // "container active"

```

#### `id` (readonly)

Значение атрибута `id`.

```javascript
var html = '<div id="main">Content</div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.id); // "main"

```

#### `attributes` (readonly)

Коллекция атрибутов с методом `getNamedItem()`.

```javascript
var html = '<input type="text" name="username" required>';
var doc = html.parse(html);
var input = doc.root.querySelector('input');
var attrs = input.attributes;
console.log(attrs.length); // 3
console.log(attrs.getNamedItem('type').value); // "text"

```

### Методы поиска элементов

#### `getElementById(id)`

Находит элемент по ID. Возвращает первый найденный элемент или `null`.

```javascript
var html = '<div><p id="intro">Hello</p><p id="main">World</p></div>';
var doc = html.parse(html);
var intro = doc.root.getElementById('intro');
console.log(intro.textContent); // "Hello"

```

#### `getElementsByTagName(tagName)`

Находит все элементы с указанным тегом. Возвращает массив.

```javascript
var html = '<div><p>First</p><p>Second</p><span>Third</span></div>';
var doc = html.parse(html);
var paragraphs = doc.root.getElementsByTagName('p');
console.log(paragraphs.length); // 2
console.log(paragraphs[0].textContent); // "First"

```

#### `getElementsByClassName(className)`

Находит все элементы с указанным классом. Возвращает массив.

```javascript
var html = '<div><p class="highlight">Text 1</p><p class="highlight bold">Text 2</p></div>';
var doc = html.parse(html);
var highlighted = doc.root.getElementsByClassName('highlight');
console.log(highlighted.length); // 2

```

#### `querySelector(selector)`

Находит первый элемент по селектору. Поддерживает:

-   По ID: `#myid`
-   По классу: `.myclass`
-   По тегу: `div`
-   По атрибуту: `input[type="text"]`

```javascript
var html = '<div><p id="first" class="intro">Hello</p><p class="content">World</p></div>';
var doc = html.parse(html);

var byId = doc.root.querySelector('#first');        // <p id="first">
var byClass = doc.root.querySelector('.intro');     // <p class="intro">
var byTag = doc.root.querySelector('p');            // первый <p>
var byAttr = doc.root.querySelector('p[class="intro"]'); // <p class="intro">

```

#### `querySelectorAll(selector)`

Находит все элементы по селектору. Поддерживает составные селекторы через запятую.

```javascript
var html = '<div><h1>Title</h1><h2>Subtitle</h2><h3>Section</h3><p>Text</p></div>';
var doc = html.parse(html);

// Найти все заголовки
var headings = doc.root.querySelectorAll('h1, h2, h3');
console.log(headings.length); // 3

// Найти все элементы с классом
var items = doc.root.querySelectorAll('.item, .highlight');

```

### Методы работы с атрибутами

#### `getAttribute(name)`

Получает значение атрибута. Возвращает `null` если атрибут не найден.

```javascript
var html = '<img src="image.jpg" alt="Description" width="100">';
var doc = html.parse(html);
var img = doc.root.querySelector('img');

console.log(img.getAttribute('src'));    // "image.jpg"
console.log(img.getAttribute('alt'));    // "Description"
console.log(img.getAttribute('height')); // null

```

#### `hasAttribute(name)`

Проверяет наличие атрибута. Возвращает `true` или `false`.

```javascript
var html = '<input type="text" required>';
var doc = html.parse(html);
var input = doc.root.querySelector('input');

console.log(input.hasAttribute('type'));     // true
console.log(input.hasAttribute('required')); // true
console.log(input.hasAttribute('disabled')); // false

```

### Расширенные методы поиска

#### `getElementsByAttribute(attrName, attrValue)`

Находит элементы по атрибуту. Если `attrValue` не указан, находит элементы с любым значением атрибута.

```javascript
var html = '<div><input type="text" name="user"><input type="password" name="pass"><button type="submit">OK</button></div>';
var doc = html.parse(html);

// Все элементы с атрибутом type
var withType = doc.root.getElementsByAttribute('type');
console.log(withType.length); // 3

// Только текстовые поля
var textInputs = doc.root.getElementsByAttribute('type', 'text');
console.log(textInputs.length); // 1

```

#### `getAllElements()`

Возвращает все элементы в дереве (только узлы типа элемент).

```javascript
var html = '<div><p>Text</p><span><a href="#">Link</a></span></div>';
var doc = html.parse(html);
var allElements = doc.root.getAllElements();
console.log(allElements.length); // 4 (div, p, span, a)

```

### Методы отладки

#### `toString()`

Возвращает строковое представление элемента.

```javascript
var html = '<div id="main" class="container">Hello World</div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.toString()); // '<div id="main" class="container">'

```

#### `debug()`

Возвращает объект с отладочной информацией.

```javascript
var html = '<div id="test" class="box">Content</div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
var info = div.debug();
// {
//   nodeType: 1,
//   nodeName: "div",
//   tagName: "DIV",
//   id: "test",
//   className: "box",
//   textContent: "Content",
//   childrenCount: 0,
//   attributesCount: 2
// }

```

#### `innerHTML()`

Возвращает HTML содержимое элемента (без самого элемента).

```javascript
var html = '<div><p>Hello</p><span>World</span></div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.innerHTML()); // "<p>Hello</p><span>World</span>"

```

#### `outerHTML()`

Возвращает полный HTML элемента (включая сам элемент).

```javascript
var html = '<div class="box"><p>Content</p></div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.outerHTML()); // '<div class="box"><p>Content</p></div>'

```

## Утилиты

### `extractLinks(rootNode)`

Извлекает все ссылки из документа.

```javascript
var html = '<div><a href="/page1" title="Page 1">Link 1</a><a href="/page2">Link 2</a></div>';
var doc = html.parse(html);
var links = html.extractLinks(doc.root);
// [
//   { text: "Link 1", href: "/page1", title: "Page 1" },
//   { text: "Link 2", href: "/page2", title: "" }
// ]

```

### `debugElements(elements, options)`

Создает отладочную информацию для массива элементов.

```javascript
var html = '<div><p class="intro">Hello</p><p class="content">World</p></div>';
var doc = html.parse(html);
var paragraphs = doc.root.getElementsByTagName('p');

var info = html.debugElements(paragraphs, {
  maxElements: 5,      // максимум элементов для вывода
  showContent: true,   // показывать содержимое
  showAttributes: true // показывать атрибуты
});
console.log(info);

```

### `logElement(element, prefix)`

Выводит информацию об элементе в консоль.

```javascript
var html = '<div id="test" class="box">Hello World</div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
html.logElement(div, 'Найден элемент: ');
// Выведет: "Найден элемент: <div id="test" class="box"> -> "Hello World""

```

## Практические примеры

### Парсинг новостной страницы

```javascript
var newsHtml = `
<div class="news-container">
  <article class="news-item" data-id="1">
    <h2>Заголовок новости</h2>
    <p class="summary">Краткое описание новости...</p>
    <a href="/news/1" class="read-more">Читать далее</a>
  </article>
  <article class="news-item" data-id="2">
    <h2>Другая новость</h2>
    <p class="summary">Другое описание...</p>
    <a href="/news/2" class="read-more">Читать далее</a>
  </article>
</div>
`;

var doc = html.parse(newsHtml);

// Найти все новости
var articles = doc.root.getElementsByClassName('news-item');
console.log('Найдено новостей:', articles.length);

// Обработать каждую новость
for (var i = 0; i < articles.length; i++) {
  var article = articles[i];
  var title = article.querySelector('h2').textContent;
  var summary = article.querySelector('.summary').textContent;
  var link = article.querySelector('a').getAttribute('href');
  var id = article.getAttribute('data-id');
  
  console.log('Новость #' + id);
  console.log('Заголовок:', title);
  console.log('Описание:', summary);
  console.log('Ссылка:', link);
  console.log('---');
}

```

### Извлечение данных формы

```javascript
var formHtml = `
<form id="registration">
  <input type="text" name="username" placeholder="Имя пользователя" required>
  <input type="email" name="email" placeholder="Email" required>
  <input type="password" name="password" placeholder="Пароль" required>
  <select name="country">
    <option value="ru">Россия</option>
    <option value="ua">Украина</option>
  </select>
  <input type="checkbox" name="agree" checked>
  <button type="submit">Зарегистрироваться</button>
</form>
`;

var doc = html.parse(formHtml);
var form = doc.root.getElementById('registration');

// Найти все поля ввода
var inputs = form.getElementsByTagName('input');
console.log('Полей ввода:', inputs.length);

// Анализ полей
for (var i = 0; i < inputs.length; i++) {
  var input = inputs[i];
  var type = input.getAttribute('type');
  var name = input.getAttribute('name');
  var required = input.hasAttribute('required');
  var checked = input.hasAttribute('checked');
  
  console.log('Поле:', name, 'тип:', type, 'обязательное:', required);
  if (type === 'checkbox') {
    console.log('Отмечено:', checked);
  }
}

```

### Поиск и анализ таблиц

```javascript
var tableHtml = `
<table class="data-table">
  <thead>
    <tr>
      <th>Имя</th>
      <th>Возраст</th>
      <th>Город</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Иван</td>
      <td>25</td>
      <td>Москва</td>
    </tr>
    <tr>
      <td>Мария</td>
      <td>30</td>
      <td>СПб</td>
    </tr>
  </tbody>
</table>
`;

var doc = html.parse(tableHtml);
var table = doc.root.querySelector('.data-table');

// Получить заголовки
var headers = table.querySelectorAll('thead th');
var headerTexts = [];
for (var i = 0; i < headers.length; i++) {
  headerTexts.push(headers[i].textContent);
}
console.log('Колонки:', headerTexts);

// Получить данные
var rows = table.querySelectorAll('tbody tr');
for (var i = 0; i < rows.length; i++) {
  var row = rows[i];
  var cells = row.getElementsByTagName('td');
  var rowData = [];
  for (var j = 0; j < cells.length; j++) {
    rowData.push(cells[j].textContent);
  }
  console.log('Строка ' + (i + 1) + ':', rowData);
}

```

## Совместимость

Библиотека разработана для Duktape 1.8.0 и использует только базовые JavaScript функции:

-   Нет стрелочных функций
-   Нет `const`/`let`
-   Нет современных методов массивов
-   Ручная реализация `trim()`
-   Совместимость с ES5

## Ограничения

1.  **CSS селекторы**: Поддерживаются только базовые селекторы (ID, класс, тег, атрибут)
2.  **Составные селекторы**: Только через запятую, без вложенности
3.  **Модификация DOM**: Только чтение, изменения не поддерживаются
4.  **События**: Не поддерживаются
5.  **Namespace**: HTML без поддержки XML namespace
