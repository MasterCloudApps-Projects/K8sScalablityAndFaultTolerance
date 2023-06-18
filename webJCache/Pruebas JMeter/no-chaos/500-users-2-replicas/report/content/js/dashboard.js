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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9984545454545455, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.999, 500, 1500, "Get post 4"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 5"], "isController": false}, {"data": [0.997, 500, 1500, "Get post 2"], "isController": false}, {"data": [0.998, 500, 1500, "Get post 3"], "isController": false}, {"data": [0.994, 500, 1500, "Get posts"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 1"], "isController": false}, {"data": [0.999, 500, 1500, "Get post 10"], "isController": false}, {"data": [1.0, 500, 1500, "Get post 8"], "isController": false}, {"data": [0.999, 500, 1500, "Get post 9"], "isController": false}, {"data": [0.998, 500, 1500, "Get post 6"], "isController": false}, {"data": [0.999, 500, 1500, "Get post 7"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5500, 0, 0.0, 77.73236363636362, 43, 1273, 66.0, 109.0, 133.0, 342.0, 18.331255791010353, 6.0181981458768, 2.327210207843111], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get post 4", 500, 0, 0.0, 72.13999999999999, 44, 627, 64.0, 90.90000000000003, 106.84999999999997, 340.52000000000044, 1.6768282458364354, 0.4224821166267581, 0.2128785858972037], "isController": false}, {"data": ["Get post 5", 500, 0, 0.0, 70.39799999999997, 44, 357, 63.5, 93.90000000000003, 105.94999999999999, 325.1100000000008, 1.6770757166144536, 0.43073331393515757, 0.21291000308581934], "isController": false}, {"data": ["Get post 2", 500, 0, 0.0, 72.50800000000005, 43, 613, 64.5, 93.0, 103.94999999999999, 456.0200000000018, 1.6764684186879286, 0.4223914570522321, 0.21283290471624097], "isController": false}, {"data": ["Get post 3", 500, 0, 0.0, 73.80599999999997, 44, 637, 63.0, 93.0, 106.89999999999998, 362.7600000000002, 1.6766370684336185, 0.4273459715441157, 0.21285431532848673], "isController": false}, {"data": ["Get posts", 500, 0, 0.0, 137.68400000000005, 88, 1213, 119.0, 163.7000000000001, 245.0999999999998, 540.9000000000001, 1.6693710477640444, 1.7639252672663046, 0.21030162613433762], "isController": false}, {"data": ["Get post 1", 500, 0, 0.0, 71.66800000000005, 44, 384, 64.0, 94.0, 105.89999999999998, 301.84000000000015, 1.6759008805183226, 0.42715832989773656, 0.2127608539720527], "isController": false}, {"data": ["Get post 10", 500, 0, 0.0, 71.46599999999997, 44, 507, 62.0, 92.0, 103.0, 341.38000000000056, 1.6777847871897777, 0.4178077350912044, 0.21463848351744225], "isController": false}, {"data": ["Get post 8", 500, 0, 0.0, 70.85400000000004, 43, 490, 63.0, 92.90000000000003, 104.94999999999999, 338.98, 1.6774695707019873, 0.4439397008400768, 0.21296000409302576], "isController": false}, {"data": ["Get post 9", 500, 0, 0.0, 71.57, 43, 509, 64.0, 94.0, 104.0, 341.6400000000003, 1.6776102777116053, 0.42431744328838455, 0.21297786728760615], "isController": false}, {"data": ["Get post 6", 500, 0, 0.0, 72.4139999999999, 43, 1273, 62.0, 92.0, 105.89999999999998, 367.2500000000007, 1.6771994793972815, 0.43076510066551277, 0.21292571515785802], "isController": false}, {"data": ["Get post 7", 500, 0, 0.0, 70.54799999999997, 43, 575, 62.0, 95.0, 108.94999999999999, 302.19000000000074, 1.6773288872935628, 0.43735040322986446, 0.21294214389469057], "isController": false}]}, function(index, item){
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
