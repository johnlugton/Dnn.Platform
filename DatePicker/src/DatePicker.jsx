import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import DayPicker, { WeekdayPropTypes, DateUtils } from "react-day-picker";
import moment from "moment";
import TimePicker from "./TimePicker";
import DateInput from "./DateInput";
import "./style.less";

const DefaultControllerClassName = "calendar-controller";

function Weekday({ weekday, className, localeUtils, locale }) {
    const weekdayName = localeUtils.formatWeekdayLong(weekday, locale);
    return (
        <div className={className} title={weekdayName}>
            {weekdayName.slice(0, 1) }
        </div>
    );
}

function hasClass(element, className) {
    return (" " + element.className + " ").indexOf(" " + className + " ") > -1;
}

Weekday.propTypes = WeekdayPropTypes;

export default class DatePicker extends Component {

    constructor(props) {
        super(props);
        let firstDate = typeof props.date === "string" ? new Date(props.date) : props.date;
        let secondDate = typeof props.secondDate === "string" ? new Date(props.secondDate) : props.secondDate;

        this.savedDate = {
            FirstDate: firstDate !== undefined ? firstDate : null,
            SecondDate: secondDate !== undefined ? secondDate : null
        };

        this.state = {
            isCalendarVisible: false,
            Date: {
                FirstDate: firstDate !== undefined ? firstDate : null,
                SecondDate: secondDate !== undefined ? secondDate : null
            }

        };
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        document.addEventListener("click", this.handleClick, false);
        this._isMounted = true;
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.handleClick, false);
        this._isMounted = false;
    }

    handleClick(e) {
        e.preventDefault();
        const isController = hasClass(e.target, DefaultControllerClassName) || this.props.controllerClassName && hasClass(e.target, this.props.controllerClassName);

        if (!this._isMounted) { return; }
        const node = ReactDOM.findDOMNode(this);
        if (node && node.contains(e.target)) {
            return;
        }
        if (isController) {
            return;
        }
        this.cancel();
    }

    resetHours(date) {
        let newDate = date;
        newDate.setHours(0);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        return newDate;
    }

    firstDisableDates(day) {
        const SecondDate = this.state.Date.SecondDate ? this.resetHours(new Date(this.state.Date.SecondDate)) : null;
        let maxDate = this.props.maxDate ? this.resetHours(new Date(this.props.maxDate)) : null;
        if (!SecondDate && !maxDate) {
            return;
        }
        if (SecondDate && maxDate) {
            maxDate = SecondDate < maxDate ? SecondDate : maxDate;    
        } else {
            maxDate = SecondDate || maxDate;
        }
        const minDate = this.resetHours(new Date(this.props.minDate));
        const thisDay = this.resetHours(day);
        return thisDay < minDate || thisDay > maxDate;
    }

    secondDisableDates(day) {
        const FirstDate = this.state.Date.FirstDate ? this.resetHours(new Date(this.state.Date.FirstDate)) : null;
        let minDate = this.props.minSecondDate ? this.resetHours(new Date(this.props.minSecondDate)) : null;
        if (!FirstDate && !minDate) {
            return;
        }
        if (FirstDate && minDate) {
            minDate =  FirstDate > minDate ? FirstDate : minDate;
        } else {
            minDate = FirstDate || minDate;
        }
        const maxDate = this.resetHours(new Date(this.props.maxSecondDate));
        const thisDay = this.resetHours(day);
        return thisDay < minDate || thisDay > maxDate;
    }

    updateDate(firstDate, secondDate, disabled, options = {}) {
        if (disabled) {
            return;
        }
        let FirstDate = firstDate;
        let SecondDate = secondDate;
        if (typeof this.props.date === "string") {
            if (FirstDate) {
                FirstDate = this.formatDate(FirstDate, "L") + " " + this.formatDate(FirstDate, "LT");
            }
            if (SecondDate) {
                SecondDate = this.formatDate(SecondDate, "L") + " " + this.formatDate(SecondDate, "LT");
            }
        }
        let {Date} = this.state;
        Date.FirstDate = FirstDate !== undefined ? FirstDate : Date.FirstDate;
        Date.SecondDate = SecondDate !== undefined ? SecondDate : Date.SecondDate;
        this.setState({
            Date
        });
        if (options.callUpdateDate || !this.props.isDateRange && !this.props.hasTimePicker) {
            this.callUpdateDate();
            if (!options.preventHide) {
                this.hideCalendar();
            }
        }
    }

    callUpdateDate() {
        let {Date} = this.state;
        this.props.updateDate(Date.FirstDate, Date.SecondDate);
        this.cashPreviousDates();
    }

    cashPreviousDates() {
        const {Date} = this.state;
        const FirstDate = Date.FirstDate;
        const SecondDate = Date.SecondDate;
        this.savedDate = { FirstDate, SecondDate };
    }

    apply() {
        this.callUpdateDate();
        this.hideCalendar();
    }

    cancel() {
        this.hideCalendar();
        const FirstDate = this.savedDate.FirstDate;
        const SecondDate = this.savedDate.SecondDate;
        this.setState({ Date: { FirstDate, SecondDate } });
    }

    updateFirstTime(time) {
        const date = new Date(this.formatDate(this.date, "L") + " " + time);
        this.updateDate(date, this.secondDate);
    }

    updateSecondTime(time) {
        const secondDate = new Date(this.formatDate(this.secondDate, "L") + " " + time);
        this.updateDate(this.date, secondDate);
    }

    firstDateClick(e, day, { disabled }) {
        this.updateDate(day, undefined, disabled);
    }

    secondDateClick(e, day, { disabled }) {
        this.updateDate(undefined, day, disabled);
    }

    formatDate(date, format = "dddd, MMMM, Do, YYYY") {
        if (date) {
            return moment(date).format(format);
        }
        return false;
    }

    showCalendar() {
        this.setState({ isCalendarVisible: true });
    }

    hideCalendar() {
        this.setState({ isCalendarVisible: false });
    }

    toggleCalendar() {
        const isCalendarVisible = !this.state.isCalendarVisible;
        this.setState({ isCalendarVisible });
        if (typeof this.props.onIconClick === "function") {
            this.props.onIconClick();
        }
    }

    getStyle() {
        let style = { width: 256 };
        if (this.props.isDateRange) {
            style.width = 512;
        }
        return style;
    }

    updateFirstDate(date) {
        const firstDate = date ? date : this.state.Date.FirstDate;
        const secondDate = this.state.Date.SecondDate;
        this.updateDate(firstDate, secondDate, false, { preventHide: true, callUpdateDate: true });
    }

    updateSecondDate(date) {
        const secondDate = date ? date : this.state.Date.SecondDate;
        const firstDate = this.state.Date.FirstDate;
        this.updateDate(firstDate, secondDate, false, { preventHide: true, callUpdateDate: true });
    }

    render() {
        this.date = this.state.Date.FirstDate;
        this.secondDate = this.state.Date.SecondDate;

        let firstDate = this.date;
        let secondDate = this.secondDate;

        let displayFirstDate = firstDate ? this.formatDate(firstDate, "L") : "";
        let displaySecondDate = secondDate ? this.formatDate(secondDate, "L") : "";

        if (this.props.hasTimePicker) {
            displayFirstDate += (displayFirstDate ? " " + this.formatDate(firstDate, "LT") : "");
            displaySecondDate += (displaySecondDate ? " " + this.formatDate(secondDate, "LT") : "");
        }
        let displayDate = displayFirstDate;
        if (this.props.isDateRange && secondDate) {
            displayDate += " - " + displaySecondDate;
        }
        const showButton = !!this.props.isDateRange || !!this.props.hasTimePicker;
        const calendarClassName = "calendar-container" + (this.state.isCalendarVisible ? " show" : "");

        firstDate = firstDate ? new Date(firstDate) : new Date();
        secondDate = secondDate ? new Date(secondDate) : new Date();

        const showIcon = this.props.showIcon !== false;
        const showInput = this.props.showInput !== false;

        const mode = this.props.mode ? "_" + this.props.mode : "";
        let icon = require(`!raw!./img/calendar${mode}.svg`);
        if (this.props.icon) {
            icon = this.props.icon;
        }

        /* eslint-disable react/no-danger */
        return <div className="dnn-day-picker">
            {showInput && <div className="calendar-text" onClick={this.showCalendar.bind(this) }>
                {this.props.isInputReadOnly && displayDate}
                {!this.props.isInputReadOnly && <div style={{ float: "right" }}>
                    <DateInput date={firstDate} onUpdateDate={this.updateFirstDate.bind(this) } hasTimePicker={this.props.hasTimePicker || false}/>
                    {this.props.isDateRange && <div>
                        <span>&nbsp; -&nbsp; </span>
                        <DateInput date={secondDate} onUpdateDate={this.updateSecondDate.bind(this) } hasTimePicker={this.props.hasTimePicker || false}/>
                    </div>}
                </div>}
            </div>}
            {showIcon && <div
                    dangerouslySetInnerHTML={{ __html: icon }}
                    className={"calendar-icon" + (this.state.isCalendarVisible ? " active" : "") }
                    onClick={this.toggleCalendar.bind(this) }>
            </div>}
            <div className={calendarClassName} style={this.getStyle() }>
                <div>
                    <DayPicker
                        weekdayElement={ <Weekday/> }
                        initialMonth={firstDate || new Date() }
                        selectedDays={day => DateUtils.isSameDay(firstDate, day) }
                        onDayClick={this.firstDateClick.bind(this) }
                        disabledDays={ this.firstDisableDates.bind(this) }
                        />
                    {this.props.hasTimePicker && <TimePicker updateTime={this.updateFirstTime.bind(this) } time={this.formatDate(this.date, "LT") }/>}
                </div>

                {this.props.isDateRange && <div>
                    <DayPicker
                        weekdayElement={ <Weekday/> }
                        initialMonth={secondDate || new Date() }
                        selectedDays={day => DateUtils.isSameDay(secondDate, day) }
                        onDayClick={this.secondDateClick.bind(this) }
                        disabledDays={ this.secondDisableDates.bind(this) }
                        />
                    {this.props.hasTimePicker && <TimePicker updateTime={this.updateSecondTime.bind(this) } time={this.formatDate(this.secondDate, "LT") }/>}
                </div>}
                {showButton && <button role="primary" onClick={this.apply.bind(this) }>{this.props.applyButtonText || "Apply"}</button>}
            </div>
        </div >;
    }
}

DatePicker.propTypes = {
    // -----REQUIRED PROPS--------:
    date: PropTypes.instanceOf(Date),
    updateDate: PropTypes.func.isRequired,

    // -----OPTIONAL PROPS--------:
    
    // if set to true, it shows 2 calendars
    isDateRange: PropTypes.bool,
    
    //if isDateRange is true the secondDate is Required
    secondDate: PropTypes.instanceOf(Date),

    //min and max dates to reduce dates user can select. 
    minDate: PropTypes.instanceOf(Date),
    maxDate: PropTypes.instanceOf(Date),

    minSecondDate: PropTypes.instanceOf(Date),
    maxSecondDate: PropTypes.instanceOf(Date),

    // if set to true, it shows time picker 
    hasTimePicker: PropTypes.bool,


    //if set to true it shows static text insted of input fields
    isInputReadOnly: PropTypes.bool,

    //show/hide an icon
    showIcon: PropTypes.bool,

    //function that will be called when icon is clicked
    onIconClick: PropTypes.func,

    //icon mode: "start" or "end". Default icon shows up if mode or custom icon is not provided
    mode: PropTypes.string,
    
    //custom icon
    icon: PropTypes.string,

    //show/hide input
    showInput: PropTypes.bool,

    applyButtonText: PropTypes.string,

    //to be able to click on element without hiding the calendar it's needed to provide class name of a controller or give to controller a default className - "calendar-controller"
    controllerClassName: PropTypes.string
};