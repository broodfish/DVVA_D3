var data_dir = "https://raw.githubusercontent.com/broodfish/DVVA_D3/master/countryPopulationDiffP.csv";
var width = 800, height = 600;
var padding = { top: 10, right: 60, bottom: 60, left: 60 };

var svg = d3.select(".chart")
	.append("svg")
  	.attr("class", "my_canvas")
    .attr("width", width + "px")
    .attr("height", height + "px");
	
var svg = d3.select(".list")
	.append("svg")
  	.attr("class", "color_legend")
    .attr("width", "70px")
    .attr("height", "450px");

var countryname = ['新北市', '宜蘭縣', '桃園市', '新竹縣', '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣', '嘉義縣', '臺南市', '高雄市',
           '屏東縣', '臺東縣', '花蓮縣', '澎湖縣', '基隆市', '新竹市', '嘉義市',  '臺北市', '金門縣', '連江縣'];
var i = 0;
	
d3.csv(data_dir, function(data){
	data.forEach(function(d){
		d.date = parseInt(d.date);
	});
	
	// get the min/max value of data
	var date_Range = d3.extent(data, function(d){ return d.date; });
	var populationDiff_Range = d3.extent(data, function(d){ return d.populationDiff; });
	var country_Range = d3.extent(data, function(d){ return d.country; });
	
	// map "date" to X-axis
	var x_scale = d3.scaleLinear()
		.domain([date_Range[0], date_Range[1]])
		.range([0, width - padding.left - padding.right]);
	
	// map "populationDiff" to Y-axis
	var y_scale = d3.scaleLinear()
		.domain([-1.5, 12])
		.range([height - padding.top - padding.bottom, 0]);
	
	// map "populationDiff" to color (square)
	var color_scale = d3.scaleOrdinal()
		.domain([country_Range[0], country_Range[1]])
		.range(["#1f77b4", "#ff7f0e", "#2ca02c", "#ABDDA4", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
			"#393b79", "#8c6d31", "#843c39", "#636363", "#7b4173", "#cedb9c", "#e7969c", "#637939", "#e7cb94", "#d6616b",
			"#9ecae1", "#de9ed6"]);
	
	// Add X axis
	d3.select(".my_canvas").append("g")
		.attr("class", "x-axis")
		.attr("transform", 'translate(' + padding.left + ',' + (height - padding.bottom) + ')')
		.call(d3.axisBottom(x_scale));
	
	// Add Y axis
	d3.select(".my_canvas").append("g")
		.attr("class", "y-axis")
		.attr("transform", 'translate(' + padding.left + ',' + padding.top + ')')
		.call(d3.axisLeft(y_scale));
		
	// add plot canvas
	d3.select(".my_canvas").append("g")
		.attr("class", "new_canvas")
		.attr("transform", 'translate(0,0)')
	
	var linePath = d3.line()
                .x(function(d){ return x_scale(d.date) })
                .y(function(d){ return y_scale(d.populationDiff) });
	
	function filter(i){
		return data.filter(function(item, index, array){
			return item.country== countryname[i];
		});
	}
	
	while (i < countryname.length){
		d3.select(".new_canvas") //線, class:line-path, id: country
		.append('path')
			.attr('class', 'line-path')
			.attr('id', function(d) { return countryname[i];})
			.attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
			.attr('d', linePath(filter(i)))
			.attr('fill', 'none')
			.attr('stroke-width', 1.5)
			.attr('stroke', function(d) { return color_scale(countryname[i]);})
			.attr('opacity', 0)
			.transition().ease(d3.easeLinear).duration(1000).attr('opacity', 1);
		i += 1;
	}
	
	d3.select(".new_canvas") //點, class:dot, id:country
		.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('r', 2.5)
		.attr('transform', function(d){
			return 'translate(' + (x_scale(d.date) + padding.left) + ',' + (y_scale(d.populationDiff) + padding.top) + ')'
		})
		.attr('class', 'dot')
		.attr('id', function(d) { return d.country;})
		.style("fill", function(d) { return color_scale(d.country);})
		.attr('opacity', 0)
		.transition().ease(d3.easeLinear).duration(1000).attr('opacity', 1);
		
	showTips = function(i, d){ //這部分是要作為Hover用的資料
		var html = '' 
		//將資料定義，並回傳
		date = d.date;
		country = d.country;
		pop = d.populationDiff;
		html = html + '<div><span>縣市：'+country+'</span><br><span>時間：'+date+'年</span><br><span>人口差：'+d3.format('0.2f')(pop)+'%</span></div>'
		return html; //回傳整理好的html
	};
	
	d3.selectAll('.dot').on('mouseover', function(d){ 
		var x = d3.select(this).attr('transform').split("(")[1].split(",")[0];
		var y = d3.select(this).attr('transform').split("(")[1].split(",")[1].split(")")[0];
		var xPos = parseFloat(x) + 10; //截取點的位置
		var yPos = parseFloat(y) - 10;
		d3.select('#tooltip').style('left',xPos+'px')
			.style('top',yPos+'px'); //將div抓來用
		d3.select('#tooltip')
			.classed('hidden', false) //移除隱藏的class
			.html(showTips(i, d));
	}).on('mouseout', function(d){ //如果移出的話
		d3.select('#tooltip').classed('hidden', true); //補回剛剛的Class
	});	
	
	for (i = 0; i < countryname.length; i++){ //color legend
		d3.select(".color_legend") //顏色方塊
			.attr('overflow','visible')
			.append("svg")
			.attr('class', 'color_bar')
			.attr('id', 'color_'+countryname[i])
			.append("rect")
				.attr('class', 'colorbox')
				.attr('transform', 'translate(0,'+ i*20 + ')')
				.style("fill", function(d) { return color_scale(countryname[i]);});
		d3.select('#color_'+countryname[i]) //文字
			.append("text")
			.attr('class', 'text')
			.attr('transform', 'translate(15,'+ (8.5+i*20) + ')')
			.html(countryname[i]);
		d3.select('#color_'+countryname[i]) //checkbox
			.append("circle")
			.attr("class", "checkbox")
			.attr("r", "5px")
			.attr('transform', 'translate(60,'+ (5 + i*20) + ')');
	}
	
	d3.selectAll('.color_bar').on('mouseover', function(d){ 
		id = d3.select(this).attr('id');
		name = d3.select(this).attr('id').split("_")[1];
		d3.select('#'+id+' .text').attr('fill','red');
		d3.selectAll('.line-path#'+name)
			.attr('stroke-width', 4)
			.raise(); 
		d3.selectAll('.dot#'+name)
			.attr('r', 4)
			.raise(); 
	}).on('mouseout', function(d){ //如果移出的話
		d3.select('#'+id+' .text').attr('fill','#000');
		name = d3.select(this).attr('id').split("_")[1];
		d3.selectAll('.line-path#'+name)
			.attr('stroke-width', 1.5);
		d3.selectAll('.dot#'+name)
			.attr('r', 2.5);
	});
	
	d3.selectAll('.color_bar').on('click', function(d){
		id = d3.select(this).attr('id')
		cbname = '#'+id+' .checkbox';
		name = d3.select(this).attr('id').split("_")[1];
		if (d3.select(cbname).classed("checked") == false) {
			d3.select(cbname).classed("checked", true);
			d3.select('.line-path#'+name).attr('opacity', 0);
			d3.selectAll('.dot#'+name).attr('opacity', 0);
		}
		else {
			d3.select(cbname).classed("checked", false);
			d3.select('.line-path#'+name).attr('opacity', 1);
			d3.selectAll('.dot#'+name).attr('opacity', 1);
		}
	});

});