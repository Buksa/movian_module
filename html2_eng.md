---

# Gumbo DOM API Documentation

A lightweight DOM library for **Duktape 1.8.0** with HTML parsing powered by **Gumbo**.

---

## Installation and Usage

```javascript
var html = require('./html2');
```

---

## Main Methods

### `parse(htmlString)`

Parses an HTML string and returns an object containing the document and root node.

```javascript
var htmlContent = '<html><body><div id="test">Hello World</div></body></html>';
var doc = html.parse(htmlContent);

console.log(doc.document); // [document]
console.log(doc.root);     // <html>
```

**Returns:**

```javascript
{
  document: Node, // the document
  root: Node      // the root element (<html>)
}
```

---

## Node Class

### Properties

#### `nodeType` (readonly)

Node type according to the DOM specification:

* `1` – element
* `3` – text node
* `8` – comment
* `9` – document

```javascript
var div = doc.root.querySelector('div');
console.log(div.nodeType); // 1
```

#### `nodeName` (readonly)

Name of the node (lowercase for elements).

```javascript
var div = doc.root.querySelector('div');
console.log(div.nodeName); // "div"
```

#### `tagName` (readonly)

Tag name in **uppercase** (elements only).

```javascript
var div = doc.root.querySelector('div');
console.log(div.tagName); // "DIV"
```

#### `textContent` (readonly)

Text content of the node and all its descendants.

```javascript
var html = '<div>Hello <span>World</span>!</div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.textContent); // "Hello World!"
```

#### `children` (readonly)

Array of child **elements only** (no text or comments).

```javascript
var html = '<div><p>Text</p><!-- comment --><span>More</span></div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.children.length); // 2 (p and span)
```

#### `childNodes` (readonly)

Array of **all** child nodes (elements, text, comments, etc).

```javascript
var html = '<div><p>Text</p><!-- comment --><span>More</span></div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.childNodes.length); // more than 2 (includes whitespace)
```

#### `className` (readonly)

Value of the `class` attribute.

```javascript
var html = '<div class="container active">Content</div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.className); // "container active"
```

#### `id` (readonly)

Value of the `id` attribute.

```javascript
var html = '<div id="main">Content</div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.id); // "main"
```

#### `attributes` (readonly)

Attribute collection with method `getNamedItem()`.

```javascript
var html = '<input type="text" name="username" required>';
var doc = html.parse(html);
var input = doc.root.querySelector('input');
var attrs = input.attributes;
console.log(attrs.length); // 3
console.log(attrs.getNamedItem('type').value); // "text"
```

---

## Element Search Methods

#### `getElementById(id)`

Finds an element by ID. Returns the first match or `null`.

```javascript
var html = '<div><p id="intro">Hello</p><p id="main">World</p></div>';
var doc = html.parse(html);
var intro = doc.root.getElementById('intro');
console.log(intro.textContent); // "Hello"
```

#### `getElementsByTagName(tagName)`

Finds all elements with the given tag name. Returns an array.

```javascript
var html = '<div><p>First</p><p>Second</p><span>Third</span></div>';
var doc = html.parse(html);
var paragraphs = doc.root.getElementsByTagName('p');
console.log(paragraphs.length); // 2
console.log(paragraphs[0].textContent); // "First"
```

#### `getElementsByClassName(className)`

Finds all elements with the given class. Returns an array.

```javascript
var html = '<div><p class="highlight">Text 1</p><p class="highlight bold">Text 2</p></div>';
var doc = html.parse(html);
var highlighted = doc.root.getElementsByClassName('highlight');
console.log(highlighted.length); // 2
```

#### `querySelector(selector)`

Finds the first element matching the selector. Supports:

* By ID: `#myid`
* By class: `.myclass`
* By tag: `div`
* By attribute: `input[type="text"]`

```javascript
var html = '<div><p id="first" class="intro">Hello</p><p class="content">World</p></div>';
var doc = html.parse(html);

var byId = doc.root.querySelector('#first');
var byClass = doc.root.querySelector('.intro');
var byTag = doc.root.querySelector('p');
var byAttr = doc.root.querySelector('p[class="intro"]');
```

#### `querySelectorAll(selector)`

Finds all elements matching the selector(s). Comma-separated selectors supported.

```javascript
var html = '<div><h1>Title</h1><h2>Subtitle</h2><h3>Section</h3><p>Text</p></div>';
var doc = html.parse(html);

var headings = doc.root.querySelectorAll('h1, h2, h3');
console.log(headings.length); // 3

var items = doc.root.querySelectorAll('.item, .highlight');
```

---

## Attribute Methods

#### `getAttribute(name)`

Gets the attribute value. Returns `null` if not found.

```javascript
var html = '<img src="image.jpg" alt="Description" width="100">';
var doc = html.parse(html);
var img = doc.root.querySelector('img');

console.log(img.getAttribute('src'));    // "image.jpg"
console.log(img.getAttribute('alt'));    // "Description"
console.log(img.getAttribute('height')); // null
```

#### `hasAttribute(name)`

Checks if the attribute exists. Returns `true` or `false`.

```javascript
var html = '<input type="text" required>';
var doc = html.parse(html);
var input = doc.root.querySelector('input');

console.log(input.hasAttribute('type'));     // true
console.log(input.hasAttribute('required')); // true
console.log(input.hasAttribute('disabled')); // false
```

---

## Advanced Search

#### `getElementsByAttribute(attrName, attrValue)`

Finds elements with the given attribute. If `attrValue` is omitted, matches any value.

```javascript
var html = '<div><input type="text" name="user"><input type="password" name="pass"><button type="submit">OK</button></div>';
var doc = html.parse(html);

var withType = doc.root.getElementsByAttribute('type');
console.log(withType.length); // 3

var textInputs = doc.root.getElementsByAttribute('type', 'text');
console.log(textInputs.length); // 1
```

#### `getAllElements()`

Returns all elements in the tree (element nodes only).

```javascript
var html = '<div><p>Text</p><span><a href="#">Link</a></span></div>';
var doc = html.parse(html);
var allElements = doc.root.getAllElements();
console.log(allElements.length); // 4 (div, p, span, a)
```

---

## Debugging Methods

#### `toString()`

Returns string representation of the element.

```javascript
var html = '<div id="main" class="container">Hello World</div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.toString()); // '<div id="main" class="container">'
```

#### `debug()`

Returns an object with debug info.

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

Returns the HTML inside the element (excluding the element itself).

```javascript
var html = '<div><p>Hello</p><span>World</span></div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.innerHTML()); // "<p>Hello</p><span>World</span>"
```

#### `outerHTML()`

Returns the full HTML including the element.

```javascript
var html = '<div class="box"><p>Content</p></div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
console.log(div.outerHTML()); // '<div class="box"><p>Content</p></div>'
```

---

## Utilities

### `extractLinks(rootNode)`

Extracts all links from the document.

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

Creates debug info for an array of elements.

```javascript
var html = '<div><p class="intro">Hello</p><p class="content">World</p></div>';
var doc = html.parse(html);
var paragraphs = doc.root.getElementsByTagName('p');

var info = html.debugElements(paragraphs, {
  maxElements: 5,
  showContent: true,
  showAttributes: true
});
console.log(info);
```

### `logElement(element, prefix)`

Logs element information to the console.

```javascript
var html = '<div id="test" class="box">Hello World</div>';
var doc = html.parse(html);
var div = doc.root.querySelector('div');
html.logElement(div, 'Found element: ');
// Output: "Found element: <div id="test" class="box"> -> "Hello World""
```

---

## Practical Examples

### Parsing a News Page

```javascript
var newsHtml = `
<div class="news-container">
  <article class="news-item" data-id="1">
    <h2>News Title</h2>
    <p class="summary">Brief summary...</p>
    <a href="/news/1" class="read-more">Read more</a>
  </article>
  <article class="news-item" data-id="2">
    <h2>Another News</h2>
    <p class="summary">Another summary...</p>
    <a href="/news/2" class="read-more">Read more</a>
  </article>
</div>
`;

var doc = html.parse(newsHtml);
var articles = doc.root.getElementsByClassName('news-item');
console.log('Articles found:', articles.length);

for (var i = 0; i < articles.length; i++) {
  var article = articles[i];
  var title = article.querySelector('h2').textContent;
  var summary = article.querySelector('.summary').textContent;
  var link = article.querySelector('a').getAttribute('href');
  var id = article.getAttribute('data-id');

  console.log('Article #' + id);
  console.log('Title:', title);
  console.log('Summary:', summary);
  console.log('Link:', link);
  console.log('---');
}
```

### Extracting Form Data

```javascript
var formHtml = `
<form id="registration">
  <input type="text" name="username" placeholder="Username" required>
  <input type="email" name="email" placeholder="Email" required>
  <input type="password" name="password" placeholder="Password" required>
  <select name="country">
    <option value="ru">Russia</option>
    <option value="ua">Ukraine</option>
  </select>
  <input type="checkbox" name="agree" checked>
  <button type="submit">Register</button>
</form>
`;

var doc = html.parse(formHtml);
var form = doc.root.getElementById('registration');

var inputs = form.getElementsByTagName('input');
console.log('Input fields:', inputs.length);

for (var i = 0; i < inputs.length; i++) {
  var input = inputs[i];
  var type = input.getAttribute('type');
  var name = input.getAttribute('name');
  var required = input.hasAttribute('required');
  var checked = input.hasAttribute('checked');

  console.log('Field:', name, 'type:', type, 'required:', required);
  if (type === 'checkbox') {
    console.log('Checked:', checked);
  }
}
```

### Table Parsing and Analysis

```javascript
var tableHtml = `
<table class="data-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Age</th>
      <th>City</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Ivan</td>
      <td>25</td>
      <td>Moscow</td>
    </tr>
    <tr>
      <td>Maria</td>
      <td>30</td>
      <td>SPB</td>
    </tr>
  </tbody>
</table>
`;

var doc = html.parse(tableHtml);
var table = doc.root.querySelector('.data-table');

var headers = table.querySelectorAll('thead th');
var headerTexts = [];
for (var i = 0; i < headers.length; i++) {
  headerTexts.push(headers[i].textContent);
}
console.log('Columns:', headerTexts);

var rows = table.querySelectorAll('tbody tr');
for (var i = 0; i < rows.length; i++) {
  var row = rows[i];
  var cells = row.getElementsByTagName('td');
  var rowData = [];
  for (var j = 0; j < cells.length; j++) {
    rowData.push(cells[j].textContent);
  }
  console.log('Row ' + (i + 1) + ':', rowData);
}
```

---

## Compatibility

Designed for **Duktape 1.8.0** and limited to basic JavaScript features:

* No arrow functions
* No `const` / `let`
* No modern array methods
* Manual `trim()` implementation
* Fully ES5 compatible

---

## Limitations

1. **CSS Selectors**: Only basic selectors supported (ID, class, tag, attribute)
2. **Compound Selectors**: Only comma-separated, no nesting
3. **DOM Manipulation**: Read-only; no modifications supported
4. **Events**: Not supported
5. **Namespace**: HTML only; no XML namespace support

---

