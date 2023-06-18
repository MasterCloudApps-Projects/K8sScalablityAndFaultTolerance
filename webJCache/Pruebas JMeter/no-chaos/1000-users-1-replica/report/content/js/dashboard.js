/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get post 4"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 5"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 2"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 3"], "isController": false}, {"data": [1.0, 500, 1500, "Get posts"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 1"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 10"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 8"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 9"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 6"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 7"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11000, 0, 0.0, 59.33400000000007, 44, 470, 49.0, 80.0, 144.0, 165.0, 60.962430516684314, 20.01412180847821, 7.44170294393119], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get post 4", 1000, 0, 0.0, 50.32500000000005, 45, 162, 48.0, 55.0, 66.0, 80.0, 5.573235095776045, 1.4041939987404488, 0.6803265497773493], "isController": false}, {"data": ["Get post 5", 1000, 0, 0.0, 50.638999999999974, 45, 353, 48.0, 54.0, 65.0, 81.99000000000001, 5.573607852098742, 1.4315027979511417, 0.6803720522581472], "isController": false}, {"data": ["Get post 2", 1000, 0, 0.0, 50.356000000000044, 44, 349, 48.0, 53.0, 58.0, 80.0, 5.572023981991218, 1.4038888548376314, 0.6801787087391624], "isController": false}, {"data": ["Get post 3", 1000, 0, 0.0, 49.91900000000001, 45, 118, 48.0, 54.0, 61.94999999999993, 79.99000000000001, 5.5727071096597305, 1.420387261348818, 0.680262098347135], "isController": false}, {"data": ["Get posts", 1000, 0, 0.0, 150.05199999999996, 136, 470, 144.0, 166.0, 175.94999999999993, 245.95000000000005, 5.556666888933342, 5.871399974439332, 0.6728776310817719], "isController": false}, {"data": ["Get post 1", 1000, 0, 0.0, 50.50899999999996, 45, 134, 48.0, 55.0, 67.0, 83.0, 5.569324162512879, 1.4195250062654896, 0.6798491409317479], "isController": false}, {"data": ["Get post 10", 1000, 0, 0.0, 50.16700000000005, 45, 353, 48.0, 54.0, 60.94999999999993, 79.0, 5.575845437564471, 1.3885161978309961, 0.6860903565753157], "isController": false}, {"data": ["Get post 8", 1000, 0, 0.0, 50.38099999999999, 44, 162, 48.0, 54.0, 68.0, 81.98000000000002, 5.575006132506745, 1.4754166620208282, 0.6805427407845148], "isController": false}, {"data": ["Get post 9", 1000, 0, 0.0, 50.226, 45, 344, 48.0, 54.0, 62.0, 80.0, 5.575596728239839, 1.410233938099725, 0.6806148349902148], "isController": false}, {"data": ["Get post 6", 1000, 0, 0.0, 49.74200000000001, 45, 122, 48.0, 53.0, 59.0, 79.0, 5.573887452064568, 1.4315746092704897, 0.6804061831133507], "isController": false}, {"data": ["Get post 7", 1000, 0, 0.0, 50.35800000000002, 44, 352, 48.0, 54.0, 63.0, 80.0, 5.574446736161436, 1.4534934360889682, 0.6804744550978316], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
