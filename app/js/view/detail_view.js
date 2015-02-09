import {View} from 'components/fxos-mvc/dist/mvc.js';

export default class DetailView extends View {
  constructor(params) {
    super(params);
  }

  init(controller) {
    super(controller);
  }

  template() {
    return `Hello World - Detail View`;
  }
}
