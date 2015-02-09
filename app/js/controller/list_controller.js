import {Controller} from 'components/fxos-mvc/dist/mvc.js';

export default class ListController extends Controller {
  constructor(options) {
    super(options);
  }

  main() {
    this.view.render();
  }
}
