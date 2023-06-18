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

    var data = {"OkPercent": 53.90909090909091, "KoPercent": 46.09090909090909};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5387272727272727, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.539, 500, 1500, "Get post 4"], "isController": false}, {"data": [0.539, 500, 1500, "Get post 5"], "isController": false}, {"data": [0.54, 500, 1500, "Get post 2"], "isController": false}, {"data": [0.54, 500, 1500, "Get post 3"], "isController": false}, {"data": [0.538, 500, 1500, "Get posts"], "isController": false}, {"data": [0.54, 500, 1500, "Get post 1"], "isController": false}, {"data": [0.538, 500, 1500, "Get post 10"], "isController": false}, {"data": [0.538, 500, 1500, "Get post 8"], "isController": false}, {"data": [0.538, 500, 1500, "Get post 9"], "isController": false}, {"data": [0.538, 500, 1500, "Get post 6"], "isController": false}, {"data": [0.538, 500, 1500, "Get post 7"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5500, 2535, 46.09090909090909, 74.97636363636383, 0, 1151, 78.0, 108.0, 121.94999999999982, 149.0, 18.306483823725205, 20.514524660705966, 1.2432416830315538], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get post 4", 500, 230, 46.0, 72.69600000000003, 39, 907, 71.5, 104.0, 121.89999999999998, 150.97000000000003, 1.6704083814410948, 1.8000607819849799, 0.11363344516717448], "isController": false}, {"data": ["Get post 5", 500, 230, 46.0, 72.99000000000011, 39, 1151, 73.0, 105.0, 115.94999999999999, 167.87000000000012, 1.6702354029776956, 1.8042783184236988, 0.11362167790178349], "isController": false}, {"data": ["Get post 2", 500, 230, 46.0, 70.33799999999991, 39, 162, 72.5, 101.0, 120.94999999999999, 145.94000000000005, 1.6710224652260226, 1.8007225292261828, 0.11367521965590305], "isController": false}, {"data": ["Get post 3", 500, 230, 46.0, 71.29800000000003, 39, 307, 74.5, 100.0, 117.84999999999997, 148.95000000000005, 1.6706930368855608, 1.8030106201779623, 0.11365280952094549], "isController": false}, {"data": ["Get posts", 500, 230, 46.0, 105.10599999999998, 75, 1102, 95.0, 125.0, 140.0, 197.99, 1.6704083814410948, 2.5259054239830556, 0.11275256574727391], "isController": false}, {"data": ["Get post 1", 500, 230, 46.0, 75.43199999999996, 39, 1095, 74.5, 102.0, 121.0, 178.95000000000005, 1.6708605265884036, 1.8031913749344186, 0.11366420340053533], "isController": false}, {"data": ["Get post 10", 500, 231, 46.2, 70.00199999999998, 39, 158, 70.0, 104.80000000000007, 116.89999999999998, 141.0, 1.668791594630496, 1.8029826468620043, 0.11397976965669619], "isController": false}, {"data": ["Get post 8", 500, 231, 46.2, 70.43399999999998, 39, 304, 70.5, 100.90000000000003, 117.94999999999999, 144.98000000000002, 1.6695717214620105, 1.8165559897137686, 0.11315587559854146], "isController": false}, {"data": ["Get post 9", 500, 231, 46.2, 72.54999999999994, 40, 1083, 73.5, 101.0, 117.89999999999998, 142.97000000000003, 1.668986557982262, 1.806700767191396, 0.11311621591512201], "isController": false}, {"data": ["Get post 6", 500, 231, 46.2, 70.23599999999996, 0, 152, 71.5, 104.90000000000003, 119.94999999999999, 134.99, 1.6701182443717015, 1.8101309111747612, 0.11319291640223128], "isController": false}, {"data": ["Get post 7", 500, 231, 46.2, 73.65800000000002, 39, 1087, 76.0, 101.0, 117.0, 149.0, 1.6700624603360166, 1.8135801911804001, 0.1131891356174221], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 2533, 99.92110453648915, 46.054545454545455], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, 0.07889546351084813, 0.03636363636363636], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5500, 2535, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 2533, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get post 4", 500, 230, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 230, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 5", 500, 230, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 230, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 2", 500, 230, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 230, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 3", 500, 230, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 230, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get posts", 500, 230, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 230, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 1", 500, 230, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 230, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 10", 500, 231, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 230, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 8", 500, 231, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 231, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 9", 500, 231, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 230, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 6", 500, 231, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 231, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 7", 500, 231, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 142.132.247.54:8080 failed to respond", 231, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
