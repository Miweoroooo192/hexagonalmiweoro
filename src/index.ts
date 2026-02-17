import hexagonal from 'hexagonal.js';
// refer to: ../Hexagonal-export/func-App.md
const app = hexagonal.App();

app.title('Miweoro');
hexagonal.defineComponent({
    name: 'not-component',
    state: {
        // define anything here!
        sea: "blue",
        test: "This is a test item",
        defaultState: 'This is the new website'
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