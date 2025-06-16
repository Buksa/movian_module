var gumbo = require('native/gumbo');

function Node(gumboNode) {
  if (!gumboNode) throw new Error('Invalid node');
  this._node = gumboNode;
}

Node.prototype = {
  get nodeType() { return gumbo.nodeType(this._node); },
  get nodeName() { return gumbo.nodeName(this._node); },
  get tagName() { 
    var type = this.nodeType;
    return type === 1 ? this.nodeName.toUpperCase() : undefined;
  },
  get textContent() { return gumbo.nodeTextContent(this._node) || ''; },
  get children() { return this._mapNodes(gumbo.nodeChilds(this._node, false)); },
  get childNodes() { return this._mapNodes(gumbo.nodeChilds(this._node, true)); },
  get className() { return this.getAttribute('class') || ''; },
  get id() { return this.getAttribute('id') || ''; },

  get attributes() {
    var attrs = gumbo.nodeAttributes(this._node);
    if (!attrs.getNamedItem) {
      attrs.getNamedItem = this._getNamedItem;
    }
    return attrs;
  },

  _getNamedItem: function(name) {
    for (var i = 0; i < this.length; i++) {
      if (this[i].name === name) return this[i];
    }
    return null;
  },

  _mapNodes: function(nodes) {
    var result = [];
    for (var i = 0; i < nodes.length; i++) {
      result[i] = new Node(nodes[i]);
    }
    result.length = nodes.length;
    return result;
  },

  getAttribute: function(name) {
    var attr = this.attributes.getNamedItem(name);
    return attr ? attr.value : null;
  },

  hasAttribute: function(name) {
    return this.attributes.getNamedItem(name) !== null;
  },

  getElementById: function(id) {
    var node = gumbo.findById(this._node, id);
    return node ? new Node(node) : null;
  },

  getElementsByTagName: function(tag) {
    return this._mapNodes(gumbo.findByTagName(this._node, tag.toLowerCase()));
  },

  getElementsByClassName: function(cls) {
    return this._mapNodes(gumbo.findByClassName(this._node, cls));
  },

  // Простой querySelector без составных селекторов
  querySelector: function(sel) {
    if (sel.charAt(0) === '#') {
      return this.getElementById(sel.slice(1));
    }
    if (sel.charAt(0) === '.') {
      var results = this.getElementsByClassName(sel.slice(1));
      return results.length > 0 ? results[0] : null;
    }
    if (sel.indexOf('[') !== -1) {
      return this._findByAttribute(sel, true);
    }
    var results = this.getElementsByTagName(sel);
    return results.length > 0 ? results[0] : null;
  },

  // Поддержка составных селекторов для querySelectorAll
  querySelectorAll: function(sel) {
    // Обработка составных селекторов (разделенных запятыми)
    if (sel.indexOf(',') !== -1) {
      return this._handleMultipleSelectors(sel);
    }
    
    if (sel.charAt(0) === '#') {
      var el = this.getElementById(sel.slice(1));
      return el ? [el] : [];
    }
    if (sel.charAt(0) === '.') {
      return this.getElementsByClassName(sel.slice(1));
    }
    if (sel.indexOf('[') !== -1) {
      return this._findByAttribute(sel, false);
    }
    return this.getElementsByTagName(sel);
  },

  // Обработка множественных селекторов
  _handleMultipleSelectors: function(sel) {
    var selectors = sel.split(',');
    var results = [];
    var seen = {}; // Избегаем дубликатов
    
    for (var i = 0; i < selectors.length; i++) {
      var trimmed = selectors[i].replace(/^\s+|\s+$/g, ''); // trim для Duktape 1.8
      var elements = this.querySelectorAll(trimmed);
      
      for (var j = 0; j < elements.length; j++) {
        var el = elements[j];
        // Простая проверка уникальности через tagName и индекс
        var key = el.tagName + '_' + this._getElementIndex(el);
        if (!seen[key]) {
          seen[key] = true;
          results.push(el);
        }
      }
    }
    
    return results;
  },

  // Получение примерного индекса элемента для уникальности
  _getElementIndex: function(targetEl) {
    var parent = this._getParent(targetEl);
    if (!parent) return 0;
    
    var siblings = parent.children;
    for (var i = 0; i < siblings.length; i++) {
      if (siblings[i] === targetEl) return i;
    }
    return 0;
  },

  // Простое получение родителя (через обход дерева)
  _getParent: function(targetEl) {
    var found = null;
    this._walkTree(this, function(node) {
      if (node.nodeType === 1) {
        var children = node.children;
        for (var i = 0; i < children.length; i++) {
          if (children[i] === targetEl) {
            found = node;
            return;
          }
        }
      }
    });
    return found;
  },

  _findByAttribute: function(sel, firstOnly) {
    var match = sel.match(/^(\w+)\[(\w+)(?:="([^"]*)")?\]$/);
    if (!match) return firstOnly ? null : [];
    
    var elements = this.getElementsByTagName(match[1]);
    var attr = match[2];
    var value = match[3];
    var result = [];
    
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var attrValue = el.getAttribute(attr);
      
      if (value !== undefined ? attrValue === value : attrValue !== null) {
        if (firstOnly) return el;
        result.push(el);
      }
    }
    
    return firstOnly ? null : result;
  },

  getElementsByAttribute: function(attr, value) {
    var result = [];
    this._walkTree(this, function(node) {
      if (node.nodeType === 1) {
        var attrValue = node.getAttribute(attr);
        if (value !== undefined ? attrValue === value : attrValue !== null) {
          result.push(node);
        }
      }
    });
    return result;
  },

  getAllElements: function() {
    var result = [];
    this._walkTree(this, function(node) {
      if (node.nodeType === 1) result.push(node);
    });
    return result;
  },

  _walkTree: function(node, callback) {
    callback(node);
    var children = node.childNodes;
    for (var i = 0; i < children.length; i++) {
      this._walkTree(children[i], callback);
    }
  },

  // Методы для отладки и удобного вывода
  toString: function() {
    var type = this.nodeType;
    if (type === 1) { // элемент
      var attrs = '';
      var id = this.id;
      var className = this.className;
      if (id) attrs += ' id="' + id + '"';
      if (className) attrs += ' class="' + className + '"';
      return '<' + this.tagName.toLowerCase() + attrs + '>';
    } else if (type === 3) { // текст
      var text = this.textContent.replace(/^\s+|\s+$/g, '');
      return text.length > 50 ? text.slice(0, 47) + '...' : text;
    } else if (type === 8) { // комментарий
      return '<!-- comment -->';
    } else if (type === 9) { // документ
      return '[document]';
    }
    return '[node:' + type + ']';
  },

  // Метод для получения отладочной информации
  debug: function() {
    return {
      nodeType: this.nodeType,
      nodeName: this.nodeName,
      tagName: this.tagName,
      id: this.id,
      className: this.className,
      textContent: this.textContent.slice(0, 100),
      childrenCount: this.children.length,
      attributesCount: this.attributes.length
    };
  },

  // Получение HTML содержимого (упрощенная версия)
  innerHTML: function() {
    var html = '';
    var children = this.childNodes;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.nodeType === 1) {
        html += child.outerHTML();
      } else if (child.nodeType === 3) {
        html += child.textContent;
      }
    }
    return html;
  },

  // Получение полного HTML элемента
  outerHTML: function() {
    if (this.nodeType !== 1) return this.textContent;
    
    var tag = this.tagName.toLowerCase();
    var attrs = '';
    var attributes = this.attributes;
    
    for (var i = 0; i < attributes.length; i++) {
      var attr = attributes[i];
      attrs += ' ' + attr.name + '="' + attr.value + '"';
    }
    
    var selfClosing = this._isSelfClosing(tag);
    if (selfClosing) {
      return '<' + tag + attrs + ' />';
    }
    
    return '<' + tag + attrs + '>' + this.innerHTML() + '</' + tag + '>';
  },

  _isSelfClosing: function(tag) {
    var selfClosingTags = {
      'area': true, 'base': true, 'br': true, 'col': true,
      'embed': true, 'hr': true, 'img': true, 'input': true,
      'link': true, 'meta': true, 'param': true, 'source': true,
      'track': true, 'wbr': true
    };
    return !!selfClosingTags[tag];
  }
};

function parse(html) {
  if (!html) return { document: null, root: null };
  
  var result = gumbo.parse(html);
  return {
    document: result.document ? new Node(result.document) : null,
    root: result.root ? new Node(result.root) : null
  };
}

function extractLinks(rootNode) {
  var links = rootNode.getElementsByTagName('a');
  var result = [];
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    result.push({
      text: link.textContent.replace(/^\s+|\s+$/g, ''),
      href: link.getAttribute('href') || '',
      title: link.getAttribute('title') || ''
    });
  }
  return result;
}

// Утилита для отладки элементов
function debugElements(elements, options) {
  options = options || {};
  var maxElements = options.maxElements || 10;
  var showContent = options.showContent !== false;
  var showAttributes = options.showAttributes !== false;
  
  var result = [];
  var count = Math.min(elements.length, maxElements);
  
  for (var i = 0; i < count; i++) {
    var el = elements[i];
    var info = {
      index: i,
      tag: el.tagName,
      id: el.id || null,
      className: el.className || null
    };
    
    if (showContent) {
      var text = el.textContent.replace(/^\s+|\s+$/g, '');
      info.textContent = text.length > 100 ? text.slice(0, 97) + '...' : text;
    }
    
    if (showAttributes && el.attributes.length > 0) {
      info.attributes = {};
      for (var j = 0; j < el.attributes.length; j++) {
        var attr = el.attributes[j];
        info.attributes[attr.name] = attr.value;
      }
    }
    
    result.push(info);
  }
  
  if (elements.length > maxElements) {
    result.push('... и еще ' + (elements.length - maxElements) + ' элементов');
  }
  
  return result;
}

// Простая функция для красивого вывода элемента
function logElement(element, prefix) {
  prefix = prefix || '';
  if (!element) {
    console.log(prefix + 'null');
    return;
  }
  
  var info = prefix + element.toString();
  if (element.nodeType === 1) {
    var text = element.textContent.replace(/^\s+|\s+$/g, '');
    if (text && text.length > 0) {
      info += ' -> "' + (text.length > 50 ? text.slice(0, 47) + '...' : text) + '"';
    }
  }
  console.log(info);
}

exports.parse = parse;
exports.Node = Node;
exports.extractLinks = extractLinks;
exports.debugElements = debugElements;
exports.logElement = logElement;