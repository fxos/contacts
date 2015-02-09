import ListController from 'js/controller/list_controller.js';
import ListView from 'js/view/list_view.js';

var ListView = new ListView({
  el: document.querySelector('body')
});

var listController = new ListController({
  view: ListView
});
listController.main();
