/* eslint-disable linebreak-style */
import {select, settings} from '../settings.js';
import utils from '../utils.js';
import BaseWidget from './BaseWidget.js';

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }
  initPlugin() {
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, {
      // eslint-disable-next-line quotes
      altInput: true,
      altFormat: 'F j, Y',
      dateFormat: 'Y-m-d',
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      // eslint-disable-next-line quotes
      "locale": {
        // eslint-disable-next-line quotes
        "firstDayOfWeek": 1
      },
      // eslint-disable-next-line quotes
      "disable": [
        function(date) {
          return (date.getDay() === 1 );
        }
        
      ],
      onChange: function(selectedDates, dateStr) {
        thisWidget.value = dateStr;
      },
    });
    
  }
  
  parseValue(value) {
    return value;
  }
  isValid() {
    return true; 
  }

  renderValue() {
    null;
  }
}
export default DatePicker;