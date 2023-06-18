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

    var data = {"OkPercent": 46.20909090909091, "KoPercent": 53.79090909090909};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4612727272727273, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.461, 500, 1500, "Get post 4"], "isController": false}, {"data": [0.46, 500, 1500, "Get post 5"], "isController": false}, {"data": [0.4605, 500, 1500, "Get post 2"], "isController": false}, {"data": [0.462, 500, 1500, "Get post 3"], "isController": false}, {"data": [0.4555, 500, 1500, "Get posts"], "isController": false}, {"data": [0.46, 500, 1500, "Get post 1"], "isController": false}, {"data": [0.464, 500, 1500, "Get post 10"], "isController": false}, {"data": [0.463, 500, 1500, "Get post 8"], "isController": false}, {"data": [0.4635, 500, 1500, "Get post 9"], "isController": false}, {"data": [0.4615, 500, 1500, "Get post 6"], "isController": false}, {"data": [0.463, 500, 1500, "Get post 7"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11000, 5917, 53.79090909090909, 77.97718181818178, 37, 1296, 82.0, 109.0, 123.0, 150.0, 36.63357433784814, 45.89190694093835, 2.1325495084024095], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get post 4", 1000, 539, 53.9, 73.5550000000001, 38, 184, 80.0, 104.0, 120.0, 141.96000000000004, 3.3462386604337393, 4.080457014636448, 0.19433346376692778], "isController": false}, {"data": ["Get post 5", 1000, 540, 54.0, 74.53699999999996, 39, 189, 80.0, 108.0, 120.0, 138.99, 3.3466642124462442, 4.094499861950101, 0.19393657652984386], "isController": false}, {"data": ["Get post 2", 1000, 539, 53.9, 75.6580000000001, 37, 1180, 80.0, 107.0, 120.0, 151.98000000000002, 3.345824411134904, 4.081258835067586, 0.19430940615798983], "isController": false}, {"data": ["Get post 3", 1000, 537, 53.7, 75.74199999999975, 39, 1003, 81.0, 103.0, 120.94999999999993, 145.0, 3.346115494522409, 4.07414069139948, 0.19516937513802726], "isController": false}, {"data": ["Get posts", 1000, 540, 54.0, 107.98799999999994, 75, 1296, 94.0, 128.0, 143.94999999999993, 489.95000000000005, 3.335701681527218, 5.309629211740336, 0.19180284668781503], "isController": false}, {"data": ["Get post 1", 1000, 540, 54.0, 75.28399999999992, 38, 1085, 80.0, 107.89999999999998, 124.0, 143.98000000000002, 3.3448507694829197, 4.089276053042644, 0.19383148892687155], "isController": false}, {"data": ["Get post 10", 1000, 536, 53.6, 73.79599999999996, 39, 219, 80.0, 106.0, 121.0, 140.99, 3.3472467222086473, 4.059111958708365, 0.19717375223010314], "isController": false}, {"data": ["Get post 8", 1000, 537, 53.7, 73.63400000000003, 39, 198, 80.0, 105.0, 121.0, 140.98000000000002, 3.3468770290441987, 4.088893393808612, 0.19521379327511998], "isController": false}, {"data": ["Get post 9", 1000, 535, 53.5, 76.29499999999987, 39, 1003, 80.0, 104.0, 120.0, 144.93000000000006, 3.3470002510250185, 4.0588751725797, 0.1960642676345076], "isController": false}, {"data": ["Get post 6", 1000, 537, 53.7, 76.70700000000004, 38, 1095, 80.0, 104.0, 116.94999999999993, 136.0, 3.3468210220522034, 4.076718890671071, 0.19521052654698434], "isController": false}, {"data": ["Get post 7", 1000, 537, 53.7, 74.553, 38, 1109, 80.0, 104.89999999999998, 120.0, 151.97000000000003, 3.3469218359874424, 4.084202304062829, 0.1952164067363496], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 5913, 99.93239817475072, 53.75454545454546], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4, 0.06760182524928172, 0.03636363636363636], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11000, 5917, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 5913, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get post 4", 1000, 539, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 539, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 5", 1000, 540, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 540, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 2", 1000, 539, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 538, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 3", 1000, 537, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 536, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get posts", 1000, 540, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 539, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 1", 1000, 540, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 540, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 10", 1000, 536, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 536, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 8", 1000, 537, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 537, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 9", 1000, 535, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 535, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 6", 1000, 537, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 537, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 7", 1000, 537, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 536, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
