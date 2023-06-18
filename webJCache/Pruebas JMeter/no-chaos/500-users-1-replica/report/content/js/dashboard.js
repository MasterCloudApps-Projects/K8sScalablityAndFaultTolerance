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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9999090909090909, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get post 4"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 5"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 2"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 3"], "isController": false}, {"data": [0.999, 500, 1500, "Get posts"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 1"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 10"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 8"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 9"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 6"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 7"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5500, 0, 0.0, 57.60181818181822, 42, 519, 48.0, 78.0, 140.0, 158.98999999999978, 30.51283758293944, 10.017442594256929, 3.724711619011162], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get post 4", 500, 0, 0.0, 48.75800000000001, 44, 80, 47.0, 53.0, 58.0, 76.98000000000002, 2.78949365111245, 0.7028216425654416, 0.34051436170806276], "isController": false}, {"data": ["Get post 5", 500, 0, 0.0, 49.57199999999997, 43, 279, 47.0, 51.0, 57.94999999999999, 83.99000000000001, 2.7896181570666605, 0.716474194637238, 0.3405295601888014], "isController": false}, {"data": ["Get post 2", 500, 0, 0.0, 48.839999999999996, 42, 99, 47.0, 52.0, 57.0, 77.98000000000002, 2.789120199924136, 0.7027275503715108, 0.3404687744048017], "isController": false}, {"data": ["Get post 3", 500, 0, 0.0, 48.55799999999998, 43, 88, 47.0, 51.0, 54.0, 78.99000000000001, 2.7892757924332527, 0.7109384588135537, 0.34048776763101224], "isController": false}, {"data": ["Get posts", 500, 0, 0.0, 145.20199999999994, 130, 519, 141.0, 159.90000000000003, 168.0, 191.9000000000001, 2.781254345709915, 2.938786330134891, 0.33679251842581004], "isController": false}, {"data": ["Get post 1", 500, 0, 0.0, 49.02599999999995, 43, 83, 47.0, 52.900000000000034, 60.0, 77.0, 2.7886068677809943, 0.7107679614168354, 0.3404061117896721], "isController": false}, {"data": ["Get post 10", 500, 0, 0.0, 48.50600000000002, 42, 87, 47.0, 51.900000000000034, 55.0, 80.0, 2.7904744364636875, 0.6948935364240628, 0.34335915917424276], "isController": false}, {"data": ["Get post 8", 500, 0, 0.0, 48.62600000000002, 43, 77, 47.0, 52.0, 58.0, 74.0, 2.790256424565418, 0.7384370029855744, 0.3406074737018332], "isController": false}, {"data": ["Get post 9", 500, 0, 0.0, 48.50600000000001, 42, 83, 47.0, 51.0, 57.0, 75.98000000000002, 2.7903809986215515, 0.705770193987287, 0.34062268049579486], "isController": false}, {"data": ["Get post 6", 500, 0, 0.0, 49.10600000000003, 43, 104, 47.0, 52.0, 62.0, 83.96000000000004, 2.7898672023211697, 0.7165381584086598, 0.34055996122084586], "isController": false}, {"data": ["Get post 7", 500, 0, 0.0, 48.91999999999995, 43, 94, 47.0, 52.0, 61.0, 82.96000000000004, 2.7900695843354333, 0.7274888466968367, 0.34058466605657145], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5500, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
