/* eslint-disable linebreak-style */
import{templates} from '../settings.js';
//import {app} from '../app.js';

class Home {
  constructor(wrap){
    const thisHome = this;
    thisHome.render(wrap);
    thisHome.linkPage;
  }
  render(wrap) {
    const thisHome = this;
    const generatedHtml = templates.homeSite();
    thisHome.dom = {};
    thisHome.dom.wrapper = wrap;
    thisHome.dom.wrapper.innerHTML = generatedHtml;
  }
 

}

export default Home;