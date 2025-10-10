'use strict';

// ============================================================
// Timezoner - Easy timezone shifting for your website visitors 
// JTRUK 2024-5. Demoparties and live events are very welcome to use this
// Please drop me a line if you do!
// Latest version, docs, contact:
// https://github.com/creativenucleus/jtruk-timezoner.js
// Update: 2025/02/10

const jtzrInit = (() => {
    // jtzr gets set by init...
    const jtzr = {
        eventTimezoneUTC: 0,
        fnTimeFormatter: null
    }

    // jtzrSelectUpdated is added to the global space, so that the <select> element can call it when it changes
    document.jtzrSelectUpdated = () => {
        setTimezone(parseFloat(document.getElementById("jtzr-timezone-select").value));
    }
    

    // defaultTimeFormatter is the default jtzr.fnTimeFormatter - this may be overriden with init params
    // TimeFormatter receives a DOM element to be set, and a params object containing:
    //  localUTCString, localIDayOfWeek, localHour, localMinute
    //  eventUTCstring, eventIDayOfWeek
    const defaultTimeFormatter = (el, p) => {
        // Omit timezone string if the event timezone is the same as the local timezone
        const utcString = (p.localUTCString == p.eventUTCstring) ? '' : ` (${p.localUTCString})`;

        // Add (on [day]) if required
        let dayString = '';
        if (p.localIDayOfWeek != p.eventIDayOfWeek) {
            // Decorate if the day in local timezone is different to the day in event timezone
            const dayStringsEN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
            dayString = ` (on ${dayStringsEN[p.localIDayOfWeek]})`;
        }        

        el.textContent = `${p.localHour.toString().padStart(2, '0')}:${p.localMinute.toString().padStart(2, '0')} ${utcString} ${dayString}`;
    }
    

    // getLocalTimezoneUTC takes a guess at our local UTC offset, provided by the browser (or OS?)
    const getLocalTimezoneUTC = () => {
        return -new Date().getTimezoneOffset() / 60;
    }


    // getTimezoneLegend converts our offset into "UTC+/-X"
    const getTimezoneLegend = (offset) => {
        return "UTC" + (offset < 0 ? offset : "+" + offset);
    }

    // getTimezonePart converts our offset into "Z" / "-XXYY" / "+XXYY", suitable for the <time> element
    const getTimezonePart = (offset) => {
        if (offset == 0) {
            return "Z";
        }

        const offsetAbs = Math.abs(offset);
        return (offset < 0 ? "-" : "+")
            + Math.trunc(offsetAbs).toString().padStart(2, '0')
            + ((offsetAbs % 1) * 60).toString().padStart(2, '0')
    }

    // setTimezone updates all the demarkated times to respect utcOffset
    const setTimezone = (utcOffset) => {
        const hourOffset = utcOffset - jtzr.eventTimezoneUTC;
        const localUTCString = getTimezoneLegend(utcOffset);
        const eventUTCString = getTimezoneLegend(jtzr.eventTimezoneUTC);
        document.querySelectorAll("time").forEach((el) => {
            const datetime = el.getAttribute("datetime");
            if (!datetime) {
                return;
            }

            const match = datetime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);   // NB ignoring timezone
            if (!match) {
                return;
            }

            // Our anchor date has been sourced from the nearest date marker above this time (or overridden in the time element itself)
            const anchorDate = el.getAttribute("data-jtzr-anchor-date");
            if (!anchorDate) {
                return;
            }
            const anchorDateTime = new Date(anchorDate);

            // Add the utcOffset to the time. This is done in minutes (to cope with x.5 and x.75 offsets)
            const localTimeInMinutes = (Number(match[4]) + hourOffset) * 60 + Number(match[5]);
            // Wrap the minutes around 24 hours (add 1440 to prevent negative numbers)
            const localTimeInMinutesWrapped = (1440 + (Number(match[4]) + hourOffset) * 60 + Number(match[5])) % 1440;
            // Split into hours and minutes
            const localMinute = localTimeInMinutesWrapped % 60;
            const localHour = (localTimeInMinutesWrapped - localMinute) / 60;

            // JS Date() is not great, so we'll just use it to see if the time has overflowed to the previous or next day...
            const eventDateTime = new Date(Date.UTC(match[1], match[2] - 1, match[3], 0, 0, 0));
            const daysDiff = Math.floor(localTimeInMinutes / 1440);
            const localIDayOfWeek = (7 + eventDateTime.getDay() + daysDiff) % 7;
 
            // Receive a formatted time string...
            jtzr.fnTimeFormatter(el, {
                localIDayOfWeek: localIDayOfWeek, localHour: localHour, localMinute: localMinute, localUTCString: localUTCString,
                eventIDayOfWeek: anchorDateTime.getDay(), eventUTCstring: eventUTCString
            })
        });
    }
    

    // makeTimezoneUI creates a <select> element and populates it with all the timezones
    const makeTimezoneUI = () => {
        const elTimezoneUI = document.getElementById("jtzr-ui");
        if (!elTimezoneUI) {
            console.warn("No jtzr-ui element found, cannot create UI");
            return;
        }

        let html = '';
        html += `<option value="${jtzr.eventTimezoneUTC}">Event Timezone: ${getTimezoneLegend(jtzr.eventTimezoneUTC)}</option>`;

        let localOffset = getLocalTimezoneUTC();
        html += `<option value="${localOffset}">Your System Timezone: ${getTimezoneLegend(localOffset)}</option>`;
        html += "<option disabled role=separator>---------</a>";

        const offsets = [-12,-11,-10,-9.5,-9,-8,-7,-6,-5,-4,-3.5,-3,-2,-1,0,1,2,3,3.5,4,4.5,5,5.5,5.75,6,6.5,7,8.75,9,9.5,10,10.5,11,12,12.75,13,14]
        offsets.forEach((offset) => {
            html += `<option value="${offset}">${getTimezoneLegend(offset)}</option>`;
        })

        html = `Timezone: <select id="jtzr-timezone-select" onchange="jtzrSelectUpdated();">${html}</select>`;
        elTimezoneUI.innerHTML = html;
    }


    // prepareDatetimes discovers our <time> elements, setting `datetime` and `data-jtzr-anchor-date` attributes, anchoring the date
    // to the one supplied in the nearest time element above it with a `jtzr-anchor-date` class
    const prepareDatetimes = () => {
        populateTempDateAnchors();
        populateTimeAttributes();
        clearTempAttributes();
    }


    // Send date attributes up the DOM tree - populate the parents of each element above our date markers with some temporary values...
    const populateTempDateAnchors = () => {
        [...document.querySelectorAll("time.jtzr-anchor-date")].reverse().forEach((el) => {
            const date = el.getAttribute("datetime");
            if (!date) {
                console.warn("time.jtzr-anchor-date element should have [datetime] set");
                return;
            }

            // Basic regex for sanity, but we won't bother checking the date is a real one
            if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                console.warn("time.jtzr-anchor-date element [datetime] attribute should be in the format 'YYYY-MM-DD'");
                return;
            }

            // Populate the parents
            let elParent = el;
            while(elParent = elParent.parentNode) {
                if(elParent.setAttribute) { // Set an attribute on this element if we are permitted...
                    elParent.setAttribute("data-jtzr-temp-anchor-date", date);
                }
            }
        });
    }


    // Read temporary anchor date values and mix them in to make the `datetime` attributes we need for the time shifting
    const populateTimeAttributes = () => {  
        const anchorDateFindInSelfOrPrevSibling = (el) => {
            do {
                const date = el.getAttribute("data-jtzr-temp-anchor-date");
                if(date) {
                    return date;
                }    
            } while(el = el.previousElementSibling)
            return null;    // Not found
        }

        const anchorDateFind = (el) => {
            do {
                const date = anchorDateFindInSelfOrPrevSibling(el);
                if(date) {
                    return date;
                }
            } while((el = el.parentNode) && (el != document.body))  // Stop before we hit the top
        
            return null;
        }
        
        document.querySelectorAll("time:not(.jtzr-anchor-date)").forEach((el) => {
            const timeContent = el.textContent;
            const timeMatch = timeContent.match(/(\d{1,2})[\.:](\d{2})/);
            if (!timeMatch) {
                console.warn(`time element does not match a time format [${timeContent}]`)
                return;
            }

            let anchorDate = anchorDateFind(el);
            if(!anchorDate) {
                console.error(`Could not find anchor date for time ${timeContent}`);
                return;
            }
            
            // Check if our element has a date override
            let date = anchorDate;
            const dateOverride = el.getAttribute("datetime");
            if (dateOverride) {
                date = dateOverride;
            }

            const timezonePart = getTimezonePart(jtzr.eventTimezoneUTC)

            el.setAttribute("datetime", `${date}T${timeMatch[1].padStart(2, '0')}:${timeMatch[2].padStart(2, '0')}:00${timezonePart}`);
            el.setAttribute("data-jtzr-anchor-date", anchorDate);
        });
    }


    // Clear up our temporary attributes...
    const clearTempAttributes = () => {
        document.querySelectorAll("[data-jtzr-temp-anchor-date]").forEach((el) => {
            el.removeAttribute("data-jtzr-temp-anchor-date");
        });
    }


    // This is our entry point. config is received from the user
    const init = (config = {}) => {
        jtzr.eventTimezoneUTC = config.eventUTC ?? 0;
        jtzr.fnTimeFormatter = config.fnTimeFormatter ?? defaultTimeFormatter;

        prepareDatetimes();
        makeTimezoneUI();
        // Run the selector, so that any <time>s that differ from their anchor date get decorated e.g. "(on [day])" appended.
        document.jtzrSelectUpdated();
    }

    return init;
})();
