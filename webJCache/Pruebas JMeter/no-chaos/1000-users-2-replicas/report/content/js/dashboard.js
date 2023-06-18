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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9981363636363636, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9995, 500, 1500, "Get post 4"], "isController": false}, {"data": [0.9975, 500, 1500, "Get post 5"], "isController": false}, {"data": [0.9995, 500, 1500, "Get post 2"], "isController": false}, {"data": [0.998, 500, 1500, "Get post 3"], "isController": false}, {"data": [0.996, 500, 1500, "Get posts"], "isController": false}, {"data": [0.998, 500, 1500, "Get post 1"], "isController": false}, {"data": [0.998, 500, 1500, "Get post 10"], "isController": false}, {"data": [0.9975, 500, 1500, "Get post 8"], "isController": false}, {"data": [0.999, 500, 1500, "Get post 9"], "isController": false}, {"data": [0.999, 500, 1500, "Get post 6"], "isController": false}, {"data": [0.9975, 500, 1500, "Get post 7"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11000, 0, 0.0, 73.53309090909066, 42, 2101, 58.0, 106.0, 130.0, 338.9899999999998, 36.626987430283855, 12.024733621909599, 4.649910513610256], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get post 4", 1000, 0, 0.0, 65.90600000000006, 43, 527, 55.0, 90.0, 104.0, 282.6800000000003, 3.351947816876387, 0.8445337272989334, 0.42554025018938507], "isController": false}, {"data": ["Get post 5", 1000, 0, 0.0, 70.23699999999997, 43, 813, 56.0, 90.0, 107.94999999999993, 407.98, 3.351689419051673, 0.8608342941509667, 0.4255074457780444], "isController": false}, {"data": ["Get post 2", 1000, 0, 0.0, 68.04299999999995, 42, 552, 56.0, 92.0, 105.0, 329.97, 3.351464757672341, 0.844412019022914, 0.42547892431387135], "isController": false}, {"data": ["Get post 3", 1000, 0, 0.0, 67.41499999999999, 42, 779, 55.0, 91.0, 105.0, 298.85000000000014, 3.351835465100689, 0.8543252503821093, 0.4255259867803609], "isController": false}, {"data": ["Get posts", 1000, 0, 0.0, 129.87200000000007, 86, 1363, 113.0, 159.0, 216.0, 458.94000000000005, 3.335712808470042, 3.5246496667622904, 0.42022163309827676], "isController": false}, {"data": ["Get post 1", 1000, 0, 0.0, 68.30999999999996, 42, 631, 55.0, 94.0, 116.94999999999993, 320.4800000000005, 3.3503755771021932, 0.8539531500231177, 0.4253406494368019], "isController": false}, {"data": ["Get post 10", 1000, 0, 0.0, 68.83999999999996, 43, 2101, 56.0, 89.0, 108.0, 325.9100000000001, 3.3529818067207167, 0.8349710553845534, 0.42894591472696664], "isController": false}, {"data": ["Get post 8", 1000, 0, 0.0, 67.41999999999999, 42, 876, 54.0, 89.0, 103.94999999999993, 346.8000000000002, 3.3528581439247884, 0.8873286689488454, 0.4256558190529517], "isController": false}, {"data": ["Get post 9", 1000, 0, 0.0, 65.65499999999989, 43, 789, 55.0, 85.0, 98.0, 309.74000000000024, 3.3529818067207167, 0.8480686405670562, 0.425671518431341], "isController": false}, {"data": ["Get post 6", 1000, 0, 0.0, 68.97199999999992, 43, 607, 56.0, 91.0, 111.94999999999993, 343.96000000000004, 3.3522624419220532, 0.8609814670170899, 0.42558019282213566], "isController": false}, {"data": ["Get post 7", 1000, 0, 0.0, 68.19399999999997, 42, 1395, 54.0, 91.0, 104.94999999999993, 358.84000000000015, 3.3527682130751257, 0.8742081180576743, 0.425644402050553], "isController": false}]}, function(index, item){
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
