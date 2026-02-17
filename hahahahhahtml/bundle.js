(function () {
    'use strict';

    function preprocess(content) {
        var c = content;
        if ("/".concat(c[0]) != c[3]) {
            throw new Error('Invalid closing tag!');
        }
        c[2].forEach(function (e) {
            if (typeof e == 'function') {
                var vNode = [];
                e(vNode); // process
                var vNodeList = preprocess(["virtual-root", {}, vNode, "/virtual-root"])[2];
                c[2].push.apply(c[2], vNodeList);
            }
            else if (typeof e == 'object') { // array is object, close enough
                preprocess(e);
            }
        });
        c[2] = c[2].filter(function (e) {
            return ['string', 'object'].indexOf(typeof e) != -1;
        });
        return c;
    }

    var styling = {
        'color': ['css', 'color'],
        'bgColor': ['css', 'background-color'],
        'borderStyle': ['css', 'border-style'],
        'borderColor': ['css', 'border-color'],
        'borderThickness': ['css', 'border-width'],
        'borderRadius': ['css', 'border-radius'],
        'width': ['css', 'width'],
        'height': ['css', 'height'],
        'margin': ['css', 'margin'],
        'padding': ['css', 'padding'],
        'rows': ['css', 'rows'],
        'cols': ['css', 'cols'],
        'fontFamily': ['css', 'font-family'],
        'fontSize': ['css', 'font-size'],
        'fontWeight': ['css', 'font-weight'],
        'inline': ['css', 'display', function (value) {
                if (!value) {
                    return 'block';
                }
                else {
                    return 'inline-block';
                }
            }],
        'onClick': ['event', 'click'],
        'onLoad': ['event', 'load'],
        'onError': ['event', 'error'],
        'onHover': ['event', 'hover'],
        'onChange': ['event', 'change'],
        'onInput': ['event', 'input'],
        'href': ['attribute', 'href'],
        'src': ['attribute', 'src'],
        'value': ['attribute', 'value']
    };

    function renderProperty(propStateObj, name, value) {
        var _a;
        var def = styling[name];
        if (def[0] == 'css' && typeof value != 'function') {
            var process = (_a = def[2]) !== null && _a !== void 0 ? _a : function (_) { return _ + ''; };
            propStateObj.style += "".concat(def[1], ":").concat(process(value), ";");
        }
        else if (def[0] == 'event' && typeof value == 'function') {
            propStateObj.elmnt.addEventListener(def[1], function (e) {
                value(e, propStateObj.component.state);
                propStateObj.component.render();
            });
        }
        else if (def[0] == 'attribute' && typeof value == 'string') {
            propStateObj.elmnt.setAttribute(def[1], value);
        }
    }

    function HTMLrender(nodeList, elmnt, component, $props) {
        var _a;
        elmnt.innerHTML = ''; // clear it
        var compList = getComponents();
        for (var i = 0; i < nodeList.length; i++) {
            var e = nodeList[i];
            if (Array.isArray(e)) {
                if (compList.indexOf(e[0]) != -1) {
                    var comp = Component(e[0], ((_a = e[1].state) !== null && _a !== void 0 ? _a : {}));
                    renderer(comp.name, comp.state, comp, e[1]);
                    elmnt.appendChild(comp.internal.$HTMLObjectRefrence);
                }
                else {
                    var el = document.createElement(nodeList[i][0]); /* unsafe */
                    var props = (nodeList[i][1]); /* unsafe */
                    var keys = Object.keys(styling);
                    var stateObj = { style: '', elmnt: el, component: component };
                    for (var j = 0; j < keys.length; j++) {
                        var propName = keys[j];
                        if (props[propName]) {
                            renderProperty(stateObj, propName, props[propName]);
                        }
                    }
                    el.setAttribute('style', stateObj.style);
                    elmnt.appendChild(el);
                    HTMLrender(e[2], el, component, props);
                }
            }
            else if (typeof e == 'string') {
                var text = document.createTextNode(e);
                elmnt.appendChild(text);
            }
        }
        if (typeof $props.onComponentLoaded == 'function') {
            $props.onComponentLoaded(component);
        }
    }
    function renderer(name, state, component, props) {
        var processed = (preprocess([name, {},
            component.internal.$render(name, state), "/".concat(name)]));
        var nodeList = processed[2];
        HTMLrender(nodeList, component.internal.$HTMLObjectRefrence, component, (props !== null && props !== void 0 ? props : {}));
        return [];
    }

    var __assign = (undefined && undefined.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    var components = {};
    function getComponents() {
        return Object.keys(components);
    }
    function Component(name, s) {
        if (!components[name]) {
            throw new Error('Invalid component');
        }
        var state = s !== null && s !== void 0 ? s : {};
        var $construct = components[name];
        var elmnt = document.createElement($construct.name); // component root; everything else will be rendered inside of it once the "render" function is called
        var component = {
            name: $construct.name,
            state: __assign(__assign({}, $construct.state), state),
            render: function () {
                return renderer(this.name, this.state, this);
            },
            internal: {
                $render: $construct.render,
                $HTMLObjectRefrence: elmnt,
            }
        };
        component.render();
        return component;
    }
    function defineComponent($construct) {
        components[$construct.name] = $construct;
    }

    function App() {
        var app = {
            title: function (newTitle) {
                if (newTitle) {
                    document.title = newTitle;
                    return newTitle;
                }
                else {
                    return document.title;
                }
            },
            init: function (rootComponent) {
                document.addEventListener('DOMContentLoaded', function () {
                    var rootComp = Component(rootComponent, {});
                    document.body.innerHTML = '';
                    rootComp.render();
                    document.body.appendChild(rootComp.internal.$HTMLObjectRefrence);
                    document.body.style.margin = '0';
                });
            },
        };
        return app;
    }

    var state = { loaded: false, state: {} };
    function getEmbeddedState() {
        return state;
    }
    document.addEventListener('DOMContentLoaded', function () {
        var dataElmnt = document.getElementById('data');
        if (dataElmnt) {
            state.state = JSON.parse(dataElmnt.innerHTML);
            state.loaded = true;
        }
    });

    var hexagonal = { App: App, defineComponent: defineComponent, Component: Component, getComponents: getComponents, getEmbeddedState: getEmbeddedState };

    // refer to: ../Hexagonal-export/func-App.md
    const app = hexagonal.App();

    app.title('Miweoro');
    hexagonal.defineComponent({
        name: 'not-component',
        state: {
            // define anything here!
            sea: "blue",
            test: "This is a test item",
            defaultState: 'This will be the new website'
        },
        render: function(name, state) {
            return [
                // my-component here!
                ['h1', {}, [ state.defaultState + '!' ], '/h1'],
                ['img', { src: 'https://miweoro.neocities.org/neocities.png' }, [], '/img']
                
                
            ];
        }
    });
    hexagonal.defineComponent({
        name: 'thememeta',
        state: {
            // define anything here!
            bgcol: "#222",
            textcolor: "#eee",
        },
        render: function(name, state) {
            return [
                // my-component here!
                ["table", {bgColor: state.bgcol, color: state.textcolor, fontFamily: "Comic Sans MS", inline: false, width: "100%", height: "100vh"}, [
                    ["div", { width: "100%", height: "20px", inline: false, bgColor: "blue", color: "white"}, [
                        ["a", {color: "#eee", href: "https://miweoro.neocities.org"}, 
                            ["Miweoro ",
                                ['img', { src: 'https://miweoro.neocities.org/favicon.png' }, []
                                , '/img']]
                            , "/a"],
                        ["a", {color: "#eee", href: "#", onClick: function() { state.bgcol = "#eee"; state.textcolor = "#222"; }},["Light Mode " ]
                        , "/a"],
                        ["a", {color: "#eee", href: "#", onClick: function() { state.bgcol = "#222"; state.textcolor = "#eee"; }},["Dark Mode "]
                        , "/a"]] // the last ] stays in the last <a>
                        , "/div"],
                        ["not-component", {  }, [], "/not-component"]]
                    , "/table"]
                
                
            ];
        }
    });
    app.init('thememeta');

})();
