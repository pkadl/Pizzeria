/* eslint-disable linebreak-style */
import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
class Booking {
  constructor(wrap) {
    const thisBooking = this;
    thisBooking.render(wrap);
    thisBooking.initWidgets();
  }
  render(wrap) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = wrap;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }
  initWidgets() {
    const thisBooking = this;  
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }

}
export default Booking;