/*********************************

chubuk.js

Copyright (c) 2016, University of Maryland
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the University of Maryland nor the names of its contributors
  may not be used to endorse or promote products derived from this software
  without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

************************************ */

// tipsy, facebook style tooltips for jquery
// Modified / simplified version for internal use
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// released under the MIT license
var activeTipsy = undefined;

function Tipsy(element, options) {
    this.jq_element = $(element);
    this.options = $.extend({}, this.defaults, options);
};
Tipsy.prototype = {
  defaults: {
    className: null,
    delayOut: 0,
    fade: true,
    fallback: '',
    gravity: 'n',
    offset: 0,
    offset_x: 0,
    offset_y: 0,
    opacity: 1
  },
  show: function() {
    var maybeCall = function(thing, ctx) {
      return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
    };
    if(activeTipsy) {
      activeTipsy.hide();
    }

    activeTipsy=this;

    var title = this.getTitle();
    if(!title) return;
    var jq_tip = this.tip();
    
    jq_tip.find('.tipsy-inner')['html'](title);
    jq_tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
    jq_tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body);
    
    var pos = $.extend({}, this.jq_element.offset(), {
      width: this.jq_element[0].offsetWidth,
      height: this.jq_element[0].offsetHeight
    });
    
    var actualWidth = jq_tip[0].offsetWidth,
        actualHeight = jq_tip[0].offsetHeight,
        gravity = maybeCall(this.options.gravity, this.jq_element[0]);
    
    var tp;
    switch (gravity.charAt(0)) {
      case 'n':
        tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
        break;
      case 's':
        tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
        break;
      case 'e':
        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
        break;
      case 'w':
        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
        break;
    }
    tp.top+=this.options.offset_y;
    tp.left+=this.options.offset_x;
    
    if (gravity.length == 2) {
      if (gravity.charAt(1) == 'w') {
        tp.left = pos.left + pos.width / 2 - 15;
      } else {
        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
      }
    }
    
    jq_tip.css(tp).addClass('tipsy-' + gravity);
    jq_tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
    if (this.options.className) {
      jq_tip.addClass(maybeCall(this.options.className, this.jq_element[0]));
    }
    
    if (this.options.fade) {
      jq_tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity},200);
    } else {
      jq_tip.css({visibility: 'visible', opacity: this.options.opacity});
    }
  },
  hide: function(){
    activeTipsy = undefined;
    if (this.options.fade) {
      this.tip().stop().fadeOut(200,function() { $(this).remove(); });
    } else {
      this.tip().remove();
    }
  },
  getTitle: function() {
    var title, jq_e = this.jq_element, o = this.options;
    var title, o = this.options;
    if (typeof o.title == 'string') {
      title = jq_e.attr(o.title == 'title' ? 'original-title' : o.title);
    } else if (typeof o.title == 'function') {
      title = o.title.call(jq_e[0]);
    }
    title = ('' + title).replace(/(^\s*|\s*$)/, "");
    return title || o.fallback;
  },
  tip: function() {
    if(this.jq_tip) return this.jq_tip;
    this.jq_tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
    this.jq_tip;
    this.jq_tip.data('tipsy-pointee', this.jq_element[0]);
    return this.jq_tip;
  },
};

function Chubuk(config){
  if(config===undefined) config = {};

  this.chart_type = "piled_bars";
  this.chart_width = null || config.width;
  this.chart_height = null || config.height;

  this.DOM = {};
  this.DOM.target = config.DOM || ".Chubuk";

  this.bar_padding = config.bar_padding || 2; // pixels
  this.bar_height_list = config.bar_height_list || 18;
  this.row_height = null; // Updated by the column information..
  this.tickWidth = config.tickWidth || 40;
  this.wrappedColumnGap = config.wrappedColumnGap || 5; // in pixels
  this.wrappedInverse = config.wrappedInverse || false;
  
  this.showTooltip = config.showTooltip || true;
  this.showColor = config.showColor || true;
  this.showGradient = config.showGradient || true;
  this.showLabel = config.showLabel || false;
  this.showGridLines = config.showGridLines || true;
  // Not actively used, just keeping it for the future / experimentation...

  this.theData = [];

  this.barScale = d3.scale.linear();

  this.color_1 = d3.rgb(146, 197, 226);
  this.color_2 = d3.rgb(239, 138, 98); // d3.rgb(255, 178, 136); // 181 132 / 153 113

  this.init();
};

Chubuk.prototype = {
  /** -- */
  init: function(){
    var me = this;

    this.DOM.root = d3.select(this.DOM.target);

    // attach settings to DOM
    ["chart_type", "showLabel", "showTooltip", "showColor",
     "showGridLines", "showGradient", "wrappedInverse", "datanegative"
    ].forEach(function(v){ 
      me.DOM.root.attr(v,me[v]); 
    })
    
    this.DOM.configPanel = this.DOM.root.select(".configPanel");

    // Add VizType selection
    this.DOM.selectVizType = this.DOM.configPanel.select(".selectVizType");
    this.DOM.selectVizType.append("div").attr("class","selectVizType-Header").text("Chart Type:");

    this.DOM.selectVizType.selectAll(".vizType").data([
        {_class:"long_list", name:"Long List"},
        {_class:"treemap", name:"Treemap"},
        {_class:"wrapped_bars", name:"Wrapped Bars"},
        {_class:"piled_bars", name:"Piled Bars"}
      ]).enter().append("div")
        .attr("class",function(d){ return "vizType "+d._class; })
        .html(function(d){ return d.name})
        .on("click",function(d){
          me.setConfig("chart_type",d._class);
        });

    this.DOM.configGroup_Display = this.DOM.configPanel.append("span")
      .attr("class","configGroup configGroup_Display")
      .attr("active",false);
    this.DOM.configGroup_Display.append("span").attr("class","configHeading").html("Display ");

    x = this.DOM.configGroup_Display.selectAll(".configOpt").data([
        { id:"button_showTooltip", name:"Tooltip"},
        { id:"button_showLabel", name:"Label"},
        { id:"button_showGridLines", name:"Axis"},
        { id:"button_showColor", name:"&lt;0 Color"},
        { id:"button_wrappedInverse", name:"Switch Col"},
        { id:"barHeightList", name:"Row <i class='fa fa-arrows-v'></i>:", 
          input: {class:"in_listRowHeight", type: "number", min:"10", max:"60", value:"18"}},
        { id:"numBands", name:"# Col:",
          input: {class:"in_numBands", type: "number", min:"1", max:"20", value:"5"}},
        { id:"columnGap", name:"Col-Gap:",
          input: {class:"in_columnGap", type: "number", min:"0", max:"40", value:"10"}},
        { id:"barPadding", name:"Bar-Pad:",
          input: {class:"in_barPadding", type: "number", min:"0", max:"10", value:"3"}},
      ]).enter()
        .append("span")
          .attr("class", function(d){ return "configOpt "+d.id; })
          .on("click", function(d){
            if(d.id.substr(0,7)==="button_"){
              var configName=d.id.substr(7);
              me.setConfig(configName,!me[configName]);
            }
          })
          ;

    x.append("span").attr("class","fa");
    x.append("span").attr("class","opt_label").html(function(d){ return d.name; });
    x.filter(function(d){ return d.input!==undefined})
      .append("input")
        .attr("class",function(d){ return d.input.class; })
        .attr("type", function(d){ return d.input.type; })
        .attr("min",  function(d){ return d.input.min; })
        .attr("max",  function(d){ return d.input.max; })
        .attr("value",function(d){ return d.input.value; })
        .on("change",function(d){
          // Callback on input change
          switch(d.input.class){
            case "in_barPadding":
              me.setConfig("bar_padding",1*this.value);
              break;
            case "in_columnGap":
              me.setConfig("wrappedColumnGap",1*this.value);
              break;
            case "in_listRowHeight":
              me.bar_height_list = 1*this.value;
              me.refreshViz();
              me.insertRowLabels();
              break;
            case "in_numBands":
              me.setNumColumns(1*this.value);
              me.refreshViz();
              break;
            default:
              break;
          }
        })
        ;

    this.DOM.configPanel.append("div").attr("class","configVisiblityButton fa fa-cog")
      .each(function(){
        this.tipsy = new Tipsy(this, { gravity: 'se', 
          title: function(){ return (me.DOM.configPanel.attr("active")==="false"?"Show":"Hide")+"<br>Config";}
        });
      })
      .on("mouseenter", function(){ this.tipsy.show(); })
      .on("mouseleave", function(){ this.tipsy.hide(); })
      .on("click", function(){
        me.DOM.configPanel.attr("active",me.DOM.configPanel.attr("active")==="false");
      });

    this.DOM.chartWrapper = this.DOM.root.append("div").attr("class","chartWrapper");
    this.DOM.chartAxis    = this.DOM.root.append("div").attr("class","chartAxis");

    this.DOM.recordGroup  = this.DOM.chartWrapper.append("div").attr("class","recordGroup");
    this.DOM.rowGroup     = this.DOM.chartWrapper.append("div").attr("class","rowGroup");

    this.DOM.recordGroup.on("scroll",function(){
      if(me.chart_type!=="long_list") return;
      if(me.firstNegativeIndex = me.theData.length) return; // no negative values
      var bottomPixel = this.scrollTop+this.offsetHeight;
      var topMostBar    = Math.ceil(this.scrollTop/me.row_height);
      var bottomMostBar = Math.ceil(bottomPixel/me.row_height);
      me.DOM.chartAxis.attr("lowerNegative",bottomMostBar>me.firstNegativeIndex+1);
      me.DOM.chartAxis.attr("upperNegative",topMostBar>me.firstNegativeIndex);
    });
  },

  /** -- */
  setSize: function(width, height){
    this.chart_height = height;
    this.chart_width = width;
    if(this.theData.length===0) return;
    this.updateHeightPerBar();
    this.refreshViz();
  },
  
  /** -- */
  setConfig: function(config,v){
    this[config] = v;
    // set the root DOM attribute
    switch(config){
      case "bar_padding":
      case "wrappedColumnGap":
        break;
      default:
        this.DOM.root.attr(config,v);
        break;
    }
    // refresh viz if the variable is used within javascript too.
    switch(config){
      case "chart_type":
        this.insertRowLabels();
        this.refreshViz();
        break;
      case "showColor": 
      case "showGradient":
      case "wrappedInverse":
      case "bar_padding":
      case "wrappedColumnGap":
        this.refreshViz();
        break;
    }
  },

  /** -- */
  getNumColumns: function(){
    return 1 + this.largestBandNo + Math.abs(this.smallestBandNo);
  },

  /** -- */
  updateHeightPerBar: function(){
    this.row_height = this.chart_height/this.rowsPerBand;
  },

  /** -- */
  sortData_decr: function(force){
    if(this.sorted_decr===true && force==undefined) return;
    this.theData.sort(function(a,b){return b.Value-a.Value;});
    this.sorted_decr = true;
    // Update firstNegativeIndex
    this.firstNegativeIndex = this.theData.length;
    this.theData.some(function(d,i){
      if(d.Value>=0) return false;
      this.firstNegativeIndex = i;
      return true;
    },this);
  },

  /** -- Figures out what the optimal number of columns would be, and applies that */
  reflow: function(){
    var numRowsPerColumn = Math.ceil(this.chart_height / 17);
    var numColumns = Math.ceil(this.theData.length / numRowsPerColumn);
    if(numColumns>0) this.setNumColumns(numColumns);
  },
  
  /** -- */
  setNumColumns: function(v){
    if(v<1){
      alert("Number of columns must be at least one");
      return;
    }
    this.rowsPerBand = Math.ceil(this.theData.length/v);
    this.updateHeightPerBar();

    this.bandInfo = {};

    // Process positive numbers
    this.largestBandNo = Math.floor((this.firstNegativeIndex-1)/this.rowsPerBand);
    this.smallestBandNo = 0;

    this.positiveBump = this.rowsPerBand-(this.firstNegativeIndex-1)%this.rowsPerBand-1;
    for(var i=this.firstNegativeIndex-1, valuePos=this.positiveBump ; i>=0; i--, valuePos++){
      var d=this.theData[i];
      // Starting from the smallest positive number, assign _rowOrder and _colOrder.
      d._rowOrder = this.rowsPerBand - valuePos%this.rowsPerBand-1;
      d._colOrder = Math.floor(valuePos/this.rowsPerBand);
      // If this is the largest band, push the _rowOrder up
      //if(d._colOrder===this.largestBandNo){
      //d._rowOrder-=this.positiveBump;
      //}
    }

    if(this.firstNegativeIndex!==this.theData.length){
      this.smallestBandNo = -Math.floor((this.theData.length-this.firstNegativeIndex)/this.rowsPerBand)-1;
      this.negativeBump = this.rowsPerBand-(this.theData.length-this.firstNegativeIndex)%this.rowsPerBand;
      // Process negative numbers
      for(var i=this.firstNegativeIndex, valuePos=this.negativeBump ; i<this.theData.length; i++, valuePos++){
        var d=this.theData[i];
        // Starting from the smallest positive number, assign _rowOrder and _colOrder.
        d._rowOrder = this.rowsPerBand - valuePos%this.rowsPerBand-1;
        d._colOrder = -Math.floor(valuePos/this.rowsPerBand)-1;
      }
    }

    this.runningSum=0;
    for(var i=this.smallestBandNo; i<=this.largestBandNo; i++){
      this.bandInfo[i] = {};
      this.bandInfo[i].min    = d3.min(this.theData,function(d){ if(i===d._colOrder) return d.Value; });
      this.bandInfo[i].max    = d3.max(this.theData,function(d){ if(i===d._colOrder) return d.Value; });
      this.bandInfo[i].absMax = Math.max(Math.abs(this.bandInfo[i].min),Math.abs(this.bandInfo[i].max));
      this.bandInfo[i].records = [];
      this.runningSum+=this.bandInfo[i].absMax;
    }

    // push items into their band...
    this.theData.forEach(function(record){
      this.bandInfo[record._colOrder].records[record._rowOrder] = record;
    }, this);

    this.insertRowLabels();

    this.refreshViz();
  },

  /** -- */
  insertRowLabels: function(){
    var me=this;
    this.DOM.rowGroup.selectAll(".rowIndexLabel").data([]).exit().remove(); // remove all existing rowIndexLabel's
    this.DOM_rowLabels = this.DOM.rowGroup.selectAll(".rowIndexLabel")
      .data(this.chart_type==="long_list" ? new Array(this.theData.length) : new Array(this.rowsPerBand))
      .enter().append("div").attr("class","rowIndexLabel")
        .text(function(d,i){ return i+1;})
        .style("top",function(d,i){ return i*me.row_height+"px"; });
  },

  /** -- */
  insertDOM_Records: function(){
    var me=this;
    this.DOM.recordGroup.selectAll(".record").data([]).exit().remove(); // remove all existing data points

    this.DOM.records = this.DOM.recordGroup.selectAll(".record")
      .data(this.theData)
      .enter().append("div").attr("class","record")
        .attr("title",function(d){ if(d.Label) return d.Label; })
        .attr("isNegative", function(d){ return (d.Value<0); })
        .attr("highlight", function(d){  return d.highlighted; })
        .on("mouseenter", function(d){ if(me.showTooltip) d.tipsy.show(); })
        .on("mouseleave", function(d){ d.tipsy.hide(); })
        .each(function(d){ d.DOM = this; })
        ;

    dataDOM_blocks = this.DOM.records.append("div").attr("class","block")
      .on("mouseover",function(d){
        if(me.chart_type==="piled_bars"){
          d.oldBackground = this.style.backgroundImage;
          var dir="right";
          if(d.Value<0) dir="left";
          if(d.Value<0 && me.showColor){
            this.style.backgroundImage = "linear-gradient(to "+dir+", rgba(202, 66, 13,0.5) 0%, rgba(202, 66, 13,1) 100%)";
          } else {
            this.style.backgroundImage = "linear-gradient(to "+dir+", rgba(42, 129, 179,0.5) 0%, rgba(42, 129, 179,1) 100%)";
          }
          return;
        }
        if(d.Value<0 && me.showColor){
          this.style.backgroundColor = "rgb(202, 66, 13)";
        } else {
          this.style.backgroundColor = "rgb(42, 129, 179)";
        }
      })
      .on("mouseout",function(d){
        if(me.chart_type==="piled_bars"){
          this.style.backgroundImage = d.oldBackground;
        } else {
          this.style.backgroundColor = null;
        }
      });

    this.DOM.records.append("div").attr("class","block_tip")
      .each(function(d){
        // record tooltip is positioned at the block_tip location
        d.tipsy = new Tipsy(this, { gravity: 'se', title: function(){ 
          return "<u>"+d.Label+"</u><br> "+d.Value.toFixed(2);
        } });
      });

    this.DOM.labels = this.DOM.records.append("div").attr("class","label")
      .text(function(d){ return d.Label;});

    // set number of columns here...

    this.reflow();
  },

  /** -- */
  insertDOM_Ticks: function(tickValues,DOM,binScale, multiScale){
    var me=this;

    var ddd = DOM.selectAll(".tick").data(tickValues);
    var ddd_enter = ddd.enter().append("span").attr("class","tick")
      .attr("value",function(d){return d})
      .style("left",function(d){ return binScale(d)+"px"; })
      .style("display",function(d){
        if(multiScale===true){
          var domain_x = binScale.domain()[0];
          if(domain_x===0)
            return (binScale.range()[1]-binScale(d)>10 || d===0)?"block":"none";
          else
            return (binScale(d)-binScale.range()[0]>10 || d===0)?"block":"none";
        }
      });

    ddd_enter.append("span").attr("class","line")
      .style("height",function(d,i){ return (me.chart_height)+"px"; })
      .style("top",function(d,i){ return "-"+(me.chart_height)+"px"; });
    ddd_enter.append("span").attr("class","text text-lower").text(function(d){ return d;});
    ddd_enter.append("span").attr("class","text text-upper").text(function(d){ return d;})
      .style("top",function(d,i){ return "-"+(me.chart_height+40)+"px"; });
  },

  /** -- */
  refreshScale: function(){
    this.DOM.chartAxis.selectAll(".scale").data([]).exit().remove(); // remove all existing ticks
    var scaleDOM = this.DOM.chartAxis.append("div").attr("class","scale");
    this.insertDOM_Ticks(
      this.barScale.ticks(this.chart_width/this.tickWidth),
      scaleDOM,
      this.barScale
    );
  },

  /** -- */
  refreshViz: function(){
    if(this.theData.length>0) this["refreshViz_"+this.chart_type]();
  },

  /** -- */
  refreshViz_long_list: function (){
    var me=this;
    this.sortData_decr();

    this.row_height = this.bar_height_list;

    this.barScale
      .domain([0,d3.max(this.theData,function(d){ return Math.abs(d.Value); })])
      // if scrollbar is shown, reduce width
      .range([0,this.chart_width-((this.row_height*this.theData.length<=this.chart_height)?0:20)]);

    this.DOM.records
      .style("width",function(d){ return me.barScale(Math.abs(d.Value))+"px"; })
      .style("top",  function(d,i){ return (1+i*me.row_height)+"px"})
      .style("left", "0px")
      .style("height",(this.row_height-this.bar_padding)+"px")
      .style("z-index",10);
    dataDOM_blocks
      .style("background-image",null)
      .style("background-color",null)
      .style("border-color",null);
    this.DOM.labels
      .style("max-width",null)
      .style("left",null)
      .style("right",null);
    this.refreshScale();
  },

  /** -- */
  refreshViz_treemap: function(){
    var treemapLayout = d3.layout.treemap();

    treemapLayout
      .mode("squarify")
      .padding(0)
      .size([this.chart_width, this.chart_height])
      .value(function(d){ 
        d.value_tmap = d.Value;
        return Math.abs(d.value_tmap);
      })
      .sort(function(a,b){ return Math.abs(a.value_tmap)-Math.abs(b.value_tmap); })
      ;
    this.sorted_decr = false;

    treemapLayout.nodes({"children": this.theData});

    this.DOM.records
      .style("left",  function(d){ return d.x+"px"; })
      .style("width", function(d){ return d.dx+"px"; })
      .style("top",   function(d){ return (1+d.y)+"px"; })
      .style("height",function(d){ return d.dy+"px"; })
      .style("z-index",10);
    dataDOM_blocks
      .style("background-image",null)
      .style("background-color",null)
      .style("border-color",null);
    this.DOM.labels
      .style("max-width","100%")
      .style("left",null)
      .style("right",null);
  },

  /** -- */
  refreshViz_wrapped_bars: function(){
    var me = this;

    this.sortData_decr();

    // subtract the vertical gap between columns from total scale width.
    var totalScaleWidth = this.chart_width - (this.getNumColumns()-1)*this.wrappedColumnGap;

    this.runningSum=0;
    if(!this.wrappedInverse){
      for(var i=this.largestBandNo; i>=this.smallestBandNo; i--){
        this.bandInfo[i].runningSum = this.runningSum;
        this.runningSum+=this.bandInfo[i].absMax;
      }
    } else {
      for(var i=this.smallestBandNo; i<=this.largestBandNo; i++){
        this.bandInfo[i].runningSum = this.runningSum;
        this.runningSum+=this.bandInfo[i].absMax;
      }
    }

    // Use 0th (smallest positive) band to create the scale...
    // Note: We could have used any column to create the scale, it's the same across the chart.
    this.barScale
      .domain([0, this.bandInfo[0].max])
      .range ([0, totalScaleWidth * this.bandInfo[0].max/this.runningSum]);

    this.DOM.records
      .style("height", (this.row_height-this.bar_padding)+"px")
      .style("top",function(d){ return (me.bar_padding/2 + d._rowOrder*me.row_height)+"px" })
      .style("width",function(d){ return me.barScale(Math.abs(d.Value))+"px"; })
      .style("left",function(d){
        var v = me.barScale(me.bandInfo[d._colOrder].runningSum);
        // offset based on column number and the column gap width
        if(!me.wrappedInverse){
          v += me.wrappedColumnGap*(me.largestBandNo-d._colOrder);
        } else {
          v += me.wrappedColumnGap*(d._colOrder-me.smallestBandNo);
        }
        if(d.Value>=0) return v+"px";
        return (v+me.barScale(d.Value-me.bandInfo[d._colOrder].min))+"px";
      })
      // z-index is used for text/label display. Otherwise, text may appear below other bars.
      .style("z-index",function(d){
        if(!me.wrapped_inverse) return (Math.abs(d._colOrder))*10;
        return (10-Math.abs(d._colOrder))*10;
      });

    dataDOM_blocks
      .style("background-image",null)
      .style("background-color",null)
      .style("border-color",null);

    this.DOM.labels
      .style("max-width","100%")
      .style("left",null)
      .style("right",null);

    // Update chart scales
    this.DOM.chartAxis.selectAll(".scale").data([]).exit().remove(); // remove all existing ticks
    for(var bandNo in this.bandInfo){
      var bandInfo = this.bandInfo[bandNo];
      var band_width = totalScaleWidth * (bandInfo.absMax/this.runningSum);

      var binScale = d3.scale.linear()
        .domain((bandInfo.max>0) ? [0,bandInfo.max] : [bandInfo.min,0])
        .range([0,band_width]);

      var gap;
      if(!me.wrappedInverse){
        gap = me.wrappedColumnGap*(me.largestBandNo-bandNo);
      } else {
        gap = me.wrappedColumnGap*(bandNo-me.smallestBandNo);
      }

      var scaleDOM = this.DOM.chartAxis.append("div").attr("class","scale")
        .style("left",(me.barScale(bandInfo.runningSum)+gap)+"px");

      var tickValues = binScale.ticks(band_width/this.tickWidth);

      this.insertDOM_Ticks(
        tickValues,
        scaleDOM,
        binScale,
        true
      );
    }
  },
  
  /** -- */
  refreshViz_piled_bars: function(){
    var me=this;

    this.sortData_decr();

    // This is not interpolated
    var colorInterp_pos = d3.interpolateRgb(this.color_1, this.color_1);
    var colorInterp_neg = d3.interpolateRgb(this.color_2, this.color_2);
    var colorInterp = function(v,positive){
      return (positive || me.showColor===false) ? colorInterp_pos(v) : colorInterp_neg(v);
    };

    this.barScale
      .domain([
        (this.firstNegativeIndex===this.theData.length) ? 0 : (d3.min(this.theData,function(d){ return d.Value;})) ,
        d3.max(this.theData,function(d){ return d.Value;})
      ])
      .range([0,this.chart_width]);

    var zeroPt = this.barScale(0);

    this.DOM.records
      .each(function(d){
        // d.band_Ratio is used to interpolate the color
        d.bandRatio = 0;
        if(d._colOrder>=0){
          if(me.largestBandNo>0){
            d.bandRatio = 1 - d._colOrder / (me.largestBandNo);
          }
        } else {
          if(me.smallestBandNo<-1){
            d.bandRatio = 1 - (d._colOrder+1) / (me.smallestBandNo+1);
          }
        }
      })
      .style("height",(this.row_height-this.bar_padding)+"px")
      .style("width",  function(d){ return Math.abs(me.barScale(d.Value)-zeroPt)+"px"; })
      .style("left",   function(d){ return ( (d.Value>=0) ? zeroPt : me.barScale(d.Value) ) +"px"; })
      .style("top",    function(d){ return (d._rowOrder*me.row_height)+"px" })
      .style("z-index",function(d){ return me.largestBandNo+5-Math.abs(d._colOrder); });

    dataDOM_blocks
      .each(function(d){
        var color = me.color_1.brighter(0.4).darker( 0.3 * d.bandRatio );
        if(d.Value<0 && me.showColor){
          color = me.color_2.brighter(0.5).darker( 0.3 * d.bandRatio );
        }
        // color = colorInterp(d.bandRatio,d.Value>=0);
        // color = me.color_1;

        var gradientPos=0;
        var gradientPos_2=0;
        if(d._colOrder>0){ // Positive columns, not the first one
          gradientPos = Math.abs(me.barScale(me.bandInfo[d._colOrder-1].max)-zeroPt);
          var prevBand_record = me.bandInfo[d._colOrder-1].records[d._rowOrder];
          if(prevBand_record!==undefined){
            gradientPos_2 = Math.abs(me.barScale(prevBand_record.Value)-zeroPt);
          }
        }
        if(d._colOrder<-1){ // Negative columns, not the last one.
          gradientPos = Math.abs(me.barScale(me.bandInfo[d._colOrder+1].min)-zeroPt);
          var nextBand_record = me.bandInfo[d._colOrder+1].records[d._rowOrder];
          if(nextBand_record!==undefined){
            gradientPos_2 = Math.abs(me.barScale(nextBand_record.Value)-zeroPt);
          }
        }

        d._gradientPos = gradientPos;
        d._gradientPos_2 = gradientPos_2;

        this.style.borderColor = color;

        var color_d3 = d3.rgb(color);
        this.style.backgroundImage = "linear-gradient(to "+((d.Value>=0)?"right":"left")+", "+
            "rgba(255,255,255,0) "+Math.max(0,gradientPos_2-2)+"px, "+
            "rgba(255,255,255,1) "+(gradientPos_2+1)+"px, "+
            "rgba("+color_d3.r+","+color_d3.g+","+color_d3.b+","+"1) "+gradientPos+"px)"
            ;
      });

    this.DOM.labels
      .style("max-width",function(d){
        if(d._colOrder===0 || d._colOrder===-1) return "100%";
        if(d._colOrder>=0){
          var prevBand_record = me.bandInfo[d._colOrder-1].records[d._rowOrder];
          if(prevBand_record)
            return (me.barScale(d.Value)-me.barScale(prevBand_record.Value)-2)+"px";
        }
        if(d._colOrder<0){
          var nextBand_record = me.bandInfo[d._colOrder+1].records[d._rowOrder];
          if(nextBand_record)
            return Math.abs(me.barScale(d.Value)-me.barScale(nextBand_record.Value)-2)+"px";
        }
        return "100%";
      });

    this.refreshScale();
  }
};

/*
// TODO

Vary the luminance across columns - May make it easier to perceive the column structure. 
  We cannot use color for another varible, so, just use it the best way you can.

Stephen Few:
- when the scale is small, such as in the rightmost column of bars, 
   it is helpful to add minor tick marks or grid lines to support more precise comparisons of short bars. 
(re: what if column skip happens when adjacent blocks have a wider gap, made invisible by switch of column)
- Intelligence could be incorporated into the algorithm that determines the break points, 
  but even that might not be worth the effort to correct such a rare problem. 

- Maybe have some "histogram" mode? It may be nice to animate changes between these chart types!

?? Avoid subpixel positioning of bars (creates rendering problems - use exact pixel height) ??

- Calculate a skewness value for the generated data
  - To log/use with the user study.

Long-list:
  - No mirroring (option)
  - Two-column layout for negative values (negative on left side)

Runtime animation speed 
- Use translate / scale instead of left/right/top/down/width...
  -> faster animation

*/
