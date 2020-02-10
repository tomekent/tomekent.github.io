
/* var fname = "Data/Form_data_t_240.csv"; */

/*
function setData(t) {
	var fname = "Data/Form_data_t_"+t+".csv";
}
*/
function init() {

  initCrossfilter();
}


inputVars = getUrlVars()["fname"];

if (typeof inputVars != 'undefined') {
	fname = "Data/" + getUrlVars()["fname"] +".csv";
	}
	else
	{
/* 	window.alert("No input data: Using default"); */
	fname = "Data/EasyJet/Form_data_t_15.csv";
}


inputVars = getUrlVars()["map"];

var plotmap;
var testvar;
if (typeof inputVars != 'undefined') {
    // plotmap = getUrlVars()["map"];
    if (getUrlVars()["map"] == 'True'){
        var plotmap  = Boolean(true);
        console.log('plot map true')
    }else{
        var plotmap = Boolean(false);
        console.log('plot map false')
    }

	}
	else
	{
/* 	window.alert("No input data: Using default"); */
	plotmap = false;
}


function init() {d3.csv(fname, function(error, flights) {
    var idDimension;
    var idGrouping;
    if (plotmap == true) {
        var map;
        var markers = [];
        initMap();
        console.log('map initiated')
    }else{
        console.log('not plotting map')
    }
    console.log(testvar)
// Various formatters.
var formatNumber = d3.format(",d"),
  formatChange = d3.format("+,d"),
/*       formatDate = d3.time.format("%B %d, %Y"), */
  formatDate = d3.time.format("%a"),
  formatTime = d3.time.format("%I:%M %p"),
  formatPC = d3.format(",.1%");
  formatNo = d3.format(",.0f");



// A nest operator, for grouping the flight list.
var nestByDate = d3.nest()
  .key(function(d) { return d3.time.day(d.date); });
var nestByPC = d3.nest()
  .key(function(d) { return FB_pc; });

// A little coercion, since the CSV is untyped.
flights.forEach(function(d, i) {
    d.index = i;
	d.TA = parseDate2(d.TA,d.day),
	d.TB = parseDate2(d.TB,d.day),
	d.tdiff = +d.tdiff,
	d.Dept_A = d.Dept_A,
	d.Dept_B = d.Dept_B,
	d.Dest_A = d.Dest_A,
	d.Dest_B = d.Dest_B,
	d.FB_pc = +d.FB_pc,
	d.cruise_pc = +d.cruise_pc,
	d.Distance = +d.Distance,
	d.dev = +d.dev,
	d.FB_solo = +d.FB_solo,
	d.FB_form = +d.FB_form,
    d.FB_kg = +d.FB_solo - d.FB_form,
    d.FB_tonne = + d.FB_kg/1000,
    d.FB_co2 = +(d.FB_kg * 3.16),
    d.FB_co2_tonne = +d.FB_co2/1000,
	d.lon1 = +d.lon1,
	d.lat1 = +d.lat1,
	d.lon2 = +d.lon2,
	d.lat2 = +d.lat2,
	d.lon3 = +d.lon3,
	d.lat3 = +d.lat3,
	d.lon4 = +d.lon4,
	d.lat4 = +d.lat4,
	d.lon5 = +d.lon5,
	d.lat5 = +d.lat5,
	d.lon6 = +d.lon6,
	d.lat6 = +d.lat6
});

// Create the crossfilter for the relevant dimensions and groups.
var flight = crossfilter(flights),
  all = flight.groupAll(),
  day = flight.dimension(function(d) { return d.TA; }),

  date = flight.dimension(function(d) { return d.TA.getDate(); }),
  dates = day.group(d3.time.day),

  hour = flight.dimension(function(d) { return d.TA.getHours(); }),
  hours = hour.group(function(d) {return Math.floor(d);}),

  cruise_pc = flight.dimension(function(d) { return d.cruise_pc; }),
  cruise_pcs = cruise_pc.group(function(d) { return Math.floor(d * 10) / 10;}),

  FB_pc = flight.dimension(function(d) { return d.FB_pc; }),
  FB_pcs = FB_pc.group(function(d) { return Math.floor(d * 10) / 10;}),

  FB_kg = flight.dimension(function(d) { return d.FB_tonne; }),
  FB_kgs = FB_kg.group(function(d) { return Math.floor(d * 25) / 25; }),

  FB_co2 = flight.dimension(function(d) { return d.FB_co2_tonne; }),
  FB_co2s = FB_co2.group(function(d) { return Math.floor(d * 25) / 25; }),

  distance = flight.dimension(function(d) { return d.Distance; }),
  distances = distance.group(function(d) { return Math.floor(d * 50) / 50; }),

  time_allowed = flight.dimension(function(d) { return d.tdiff; }),
  time_alloweds = time_allowed.group(),

  idDimension = flight.dimension(function(p, i) { return i; }),
  idGrouping = idDimension.group(function(id) { return id; }),


deviation = flight.dimension(function(d) { return d.dev; }),
deviations = deviation.group(function(d) { return Math.floor(d / 10) * 10; });



var charts = [

//row1
barChart() // Time of Day
        .dimension(hour)
        .group(hours)
      .x(d3.scale.linear()
        .domain([0, 24])
        .rangeRound([0, 240])),

barChart() // Flight day
        .dimension(day)
        .group(dates)
        .round(d3.time.day.round)
      .x(d3.time.scale()
        .domain([new Date(2014, 08, 1), new Date(2014, 08, 8)])
        .rangeRound([0, 10 * 48])),

//row2
barChart() // PC of flight in Cruise
        .dimension(cruise_pc)
        .group(cruise_pcs)
      .x(d3.scale.linear()
        .domain([0, 100])
        .rangeRound([0, 10 * 24])),

barChart() // Flight Distances
        .dimension(distance)
        .group(distances)
      .x(d3.scale.linear()
        .domain([0, (Math.floor(distance.top(1)[0].Distance/500)+2)*500])
        .rangeRound([0, 10 * 48])),

//row3
barChart() // PC saving in FB
        .dimension(FB_pc)
        .group(FB_pcs)
      .x(d3.scale.linear()
        .domain([0, 10])
        .rangeRound([0, 10 * 24])),

barChart() // Deviations
        .dimension(deviation)
        .group(deviations)
      .x(d3.scale.linear()
        .domain([0, (Math.floor(deviation.top(1)[0].dev/25)+2)*25])
        .rangeRound([0, 10 * 24])),

barChart() // time alloweds
        .dimension(time_allowed)
        .group(time_alloweds)
      .x(d3.scale.linear()
        .domain([0, (Math.floor(time_allowed.top(1)[0].tdiff/60)+2)*60])
        .rangeRound([0, 10 * 24])),

//row4
barChart() // PC saving in FB
      .dimension(FB_kg)
      .group(FB_kgs)
    .x(d3.scale.linear()
      .domain([0, (Math.floor(FB_kg.top(1)[0].FB_tonne/5)+2)*5])
      .rangeRound([0, 10 * 36])),

barChart() // Deviations
      .dimension(FB_co2)
      .group(FB_co2s)
    .x(d3.scale.linear()
      .domain([0, (Math.floor(FB_co2.top(1)[0].FB_co2_tonne/5)+2)*5])
      .rangeRound([0, 10 * 36]))


/* 	        .filter([new Date(2001, 1, 1), new Date(2001, 2, 1)]) */

];

// bind charts to dom
domCharts = d3.selectAll(".chart")
  .data(charts)
  .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });


// Renders all of the charts
function updateCharts() {
  domCharts.each(render);
}



	/***************
	Field Pie Chart
	***************/

	/*
var siteRingChart = dc.pieChart("#chart-ring-site");


	siteRingChart.width(150).height(150)
	    .dimension(date)
	    .group(dates)
	    .innerRadius(0);
*/




function initMap() {
  google.maps.visualRefresh = true;
  colorgrad = ["#EDD52C",'#D5D82B','#BEDC2B','#A7E02B','#8FE42B','#78E82A','#61EC2A','#49F02A','#32F42A','#1BF82A'];
  var myLatlng = new google.maps.LatLng(48.6, 8.5);

  style1=[{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];

  style2=[{"featureType":"water","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"landscape","stylers":[{"color":"#f2f2f2"}]},{"featureType":"road","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]}];

  style3=[{"featureType":"water","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":-78},{"lightness":67},{"visibility":"simplified"}]},{"featureType":"landscape","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31},{"visibility":"simplified"}]},{"featureType":"poi","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"hue":"#e9ebed"},{"saturation":-90},{"lightness":-8},{"visibility":"simplified"}]},{"featureType":"transit","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":10},{"lightness":69},{"visibility":"on"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"hue":"#2c2e33"},{"saturation":7},{"lightness":19},{"visibility":"on"}]},{"featureType":"road","elementType":"labels","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":-2},{"visibility":"simplified"}]}];
  var mapOptions = {
    zoom: 3,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false,
    panControl: false,
    styles: style2
  };
  map = new google.maps.Map(document.getElementById('map-div'), mapOptions);

  for (var i = 0; i < flights.length; i++) {
	  var point = flights[i];

 var flightPlanCoordinates = [
 	    new google.maps.LatLng(point.lat1, point.lon1),
	    new google.maps.LatLng(point.lat3, point.lon3),
	    new google.maps.LatLng(point.lat2, point.lon2),
	    new google.maps.LatLng(point.lat3, point.lon3),
	    new google.maps.LatLng(point.lat4, point.lon4),
	    new google.maps.LatLng(point.lat5, point.lon5),
	    new google.maps.LatLng(point.lat4, point.lon4),
	    new google.maps.LatLng(point.lat6, point.lon6)
	  ];
	    markers[i] = new google.maps.Polyline({
	    path: flightPlanCoordinates,
	    map: map,
	    geodesic: true,
	    strokeColor: colorgrad[Math.floor(point.FB_pc)],
	    strokeOpacity: 1.0,
	    strokeWeight: 1.0,
	    title: 'marker ' + i
	  });

//	 }


//    markers[i] = new google.maps.Marker({
//      position: new google.maps.LatLng(point.lat, point.lng),
//      map: map,
//    title: 'marker ' + i
//    });

  }
}

// set visibility of markers based on crossfilter
function updateMarkers() {
  var pointIds = idGrouping.all();
  for (var i = 0; i < pointIds.length; i++) {
    var pointId = pointIds[i];
    markers[pointId.key].setVisible(pointId.value > 0);
  }
}

/*
  function initMap() {
  google.maps.visualRefresh = true;

  var myLatlng = new google.maps.LatLng(38.1, -96.24);
  var mapOptions = {
    zoom: 4,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false,
    panControl: false
  };
  map = new google.maps.Map(document.getElementById('map-div'), mapOptions);

  // create array of markers from points and add them to the map
  for (var i = 0; i < flights.length; i++) {
    var point = flights[i];
    markers[i] = new google.maps.Marker({
      position: new google.maps.LatLng(point.lat1, point.lon1),
      map: map,
      title: 'marker ' + i
    });
  }
}
*/






  // Given our array of charts, which we assume are in the same order as the
  // .chart elements in the DOM, bind the charts to the DOM and render them.
  // We also listen to the chart's brush events to update the display.
  var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

  // Render the initial lists.
  var list = d3.selectAll(".list")
      .data([flightList]);

  var total_FB_solo = flight.groupAll().reduceSum(function(d) { return d.FB_solo;}).value()
  var total_FB_form = flight.groupAll().reduceSum(function(d) { return d.FB_form;}).value()
  avg_pc = (1-(total_FB_form/total_FB_solo));



  // Render the total.
  d3.selectAll("#total")
      .text(formatNumber(flight.size()));

   // Render the total.
  d3.selectAll("#avg_pc_total")
      .text( formatPC(avg_pc) );

  renderAll();



  // Renders the specified chart or list.
  function render(method) {
    d3.select(this).call(method);
  }

  // Whenever the brush moves, re-rendering everything.
  function renderAll() {
    chart.each(render);
    list.each(render);
    d3.select("#active").text(formatNumber(all.value()));


	//avg pc
	var total_FB_solo = flight.groupAll().reduceSum(function(d) { return d.FB_solo;}).value()
  	var total_FB_form = flight.groupAll().reduceSum(function(d) { return d.FB_form;}).value()
	var avg_pc = (1-(total_FB_form/total_FB_solo));

	avg_pc = Math.max(0, isNaN(avg_pc) ? -Infinity : avg_pc);
    d3.select("#avg_pc_active").text(formatPC(avg_pc)); //render the pc saving
    d3.select("#avg_pc_active-top").text(formatPC(avg_pc)); //render the pc saving
	//avg dist
    avg_dist = flight.groupAll().reduceSum(function(d) { return d.Distance;}).value()/all.value();
    avg_dist = Math.max(0, isNaN(avg_dist) ? -Infinity : avg_dist);

    d3.select("#avg_distance_active").text('Avg: ' + formatNo(avg_dist) +' km'); //render the pc saving
    //avg dev
    avg_dev = flight.groupAll().reduceSum(function(d) { return d.dev;}).value()/all.value();
    avg_dev = Math.max(0, isNaN(avg_dev) ? -Infinity : avg_dev);

    d3.select("#avg_dev_active").text('Avg: ' + formatNo(avg_dev) + ' km'); //render the pc saving
    d3.select("#avg_dev_active-top").text(formatNo(avg_dev)); //render the pc saving
    //avg cruise_pc
    avg_cruise_pc = flight.groupAll().reduceSum(function(d) { return d.cruise_pc;}).value()/(100*all.value());
    avg_cruise_pc = Math.max(0, isNaN(avg_cruise_pc) ? -Infinity : avg_cruise_pc);

    d3.select("#avg_cruise_pc_active").text('Avg: ' + formatPC(avg_cruise_pc)); //render the pc saving
   //avg tdiff
    avg_tdiff = flight.groupAll().reduceSum(function(d) { return d.tdiff;}).value()/all.value();
    avg_tdiff = Math.max(0, isNaN(avg_tdiff) ? -Infinity : avg_tdiff);
    d3.select("#avg_tdiff_active").text('Avg: ' + formatNo(avg_tdiff) +' mins'); //render the pc saving

    total_fb_kg = flight.groupAll().reduceSum(function(d) { return d.FB_tonne;}).value();
    total_fb_kg = Math.max(0, isNaN(total_fb_kg) ? -Infinity : total_fb_kg);

    d3.select("#fb-kg-total").text('Total: ' + formatNo(total_fb_kg) + ' Tonnes'); //render the pc saving
    d3.select("#fb-kg-total-top").text(formatNo(total_fb_kg)); //render the pc saving

    total_dollar = total_fb_kg * 600
    d3.select("#dollar-total-top").text(formatNo(total_dollar))

    total_fb_co2 = flight.groupAll().reduceSum(function(d) { return d.FB_co2_tonne;}).value();
    total_fb_co2 = Math.max(0, isNaN(total_fb_co2) ? -Infinity : total_fb_co2);

    d3.select("#co2-kg-total").text('Total: ' + formatNo(total_fb_co2) + ' Tonnes'); //render the pc saving
    d3.select("#co2-kg-total-top").text(formatNo(total_fb_co2)); //render the pc saving

    d3.select("#active-forms").text(formatNo(all.value()));


/*      initMap(); */
if (plotmap == true){
    console.log('updating markers and charts')
    updateMarkers();
    updateCharts();
/*      dc.renderAll(); */
}

  }

  // Like d3.time.format, but faster.
  function parseDate(dt) {
    return new Date(2014,08,
        dt.substring(0, 2),
        dt.substring(2, 4),
        dt.substring(4, 6));
  }


  function parseDate2(dt,dd) {
    var  daynum = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(dd) +1;
    return new Date(2014,08,daynum,
        dt.substring(0, 2),
        dt.substring(2, 4));
  }

  function parseTname(dt) {
    var daynum = ['15','30','45','60','120','240'].indexOf(dt) +1;
    return daynum;
  }


  window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
  };

  window.filterIATA = function(filters) {
    filters.forEach(function(d, i) { flight[i].filter(d); });
    renderAll();
  };


  window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
  };

  function flightList(div) {
    var flightsByDate = nestByPC.entries(FB_pc.top(40));

    div.each(function() {
      var date = d3.select(this).selectAll(".date")
          .data(flightsByDate, function(d) { return d.key; });

      date.enter().append("div")
          .attr("class", "date")
        .append("div")
          .attr("class", "none")
          .text(function(d) { return d.FB_pc; });

      date.exit().remove();

      var flight = date.order().selectAll(".flight")
          .data(function(d) { return d.values; }, function(d) { return d.index; });

      var flightEnter = flight.enter().append("div")
          .attr("class", "flight");
    /*

      flightEnter.append("div")
	      .attr("class", "time")
	      .text(function(d) { return d.day; });
*/

	  flightEnter.append("div")
          .attr("class", "day")
          .text(function(d) { return d.day ; });



      flightEnter.append("div")
          .attr("class", "origin")
          .text(function(d) { return d.Dept_A + " - " + d.Dest_A; });


      flightEnter.append("div")
          .attr("class", "time")
          .text(function(d) { return formatTime(d.TA) ; });

      flightEnter.append("div")
          .attr("class", "destination")
          .text(function(d) { return d.Dept_B + " - " + d.Dest_B; });

      flightEnter.append("div")
          .attr("class", "time")
          .text(function(d) { return formatTime(d.TB) ; });

      flightEnter.append("div")
          .attr("class", "percentage")
          .text(function(d) { return (Math.floor(d.FB_pc*100)/100) + "%"; });

      flightEnter.append("div")
          .attr("class", "fb-saving")
          .text(function(d) { return (Math.floor(d.FB_tonne*100)/100); });

      flightEnter.append("div")
          .attr("class", "co2-saving")
          .text(function(d) { return (Math.floor(d.FB_co2_tonne*100)/100); });

      flightEnter.append("div")
          .attr("class", "cruise")
          .text(function(d) { return (Math.floor((d.cruise_pc*10)/10)) +"%"; });


     flightEnter.append("div")
	      .attr("class", "tdiff")
	      .text(function(d) { return (Math.floor(d.tdiff)) +" m"; });


      flight.exit().remove();

      flight.order();
    });
  }


  function barChart() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 10, right: 5, bottom: 20, left: 5},
        x,
        y = d3.scale.linear().range([100, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round;

    function chart(div) {
      var width = x.range()[1],
          height = y.range()[0];

      y.domain([0, group.top(1)[0].value]);

      div.each(function() {
        var div = d3.select(this),
            g = div.select("g");

        // Create the skeletal chart.
        if (g.empty()) {
          div.select(".resetbutton_div").append("a")
              .attr("href", "javascript:reset(" + id + ")")
              .attr("class", "reset")
              .text("reset")
              .style("display", "none");

          g = div.append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          g.append("clipPath")
              .attr("id", "clip-" + id)
            .append("rect")
              .attr("width", width)
              .attr("height", height);

          g.selectAll(".bar")
              .data(["background", "foreground"])
            .enter().append("path")
              .attr("class", function(d) { return d + " bar"; })
              .datum(group.all());

          g.selectAll(".foreground.bar")
              .attr("clip-path", "url(#clip-" + id + ")");

          g.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(axis);

          // Initialize the brush component with pretty resize handles.
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", height);
          gBrush.selectAll(".resize").append("path").attr("d", resizePath);
        }

        // Only redraw the brush if set externally.
        if (brushDirty) {
          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".resetbutton_div a").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
                .attr("x", 0)
                .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
          }
        }

        g.selectAll(".bar").attr("d", barPath);
      });

      function barPath(groups) {
        var path = [],
            i = -1,
            n = groups.length,
            d;
        while (++i < n) {
          d = groups[i];
          path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
        }
        return path.join("");
      }

      function resizePath(d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
      }
    }

    brush.on("brushstart.chart", function() {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      div.select(".resetbutton_div a").style("display", null);
    });

    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
          extent = brush.extent();
      if (round) g.select(".brush")
          .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
          .style("display", null);
      g.select("#clip-" + id + " rect")
          .attr("x", x(extent[0]))
          .attr("width", x(extent[1]) - x(extent[0]));
      dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".resetbutton_div a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
      }
    });

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      axis.scale(x);
      brush.x(x);
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return chart;
    };

    chart.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };

    chart.filter = function(_) {
      if (_) {
        brush.extent(_);
        dimension.filterRange(_);
      } else {
        brush.clear();
        dimension.filterAll();
      }
      brushDirty = true;
      return chart;
    };

    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.round = function(_) {
      if (!arguments.length) return round;
      round = _;
      return chart;
    };

    return d3.rebind(chart, brush, "on");
  }
});}
