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

    var data = {"OkPercent": 63.85454545454545, "KoPercent": 36.14545454545455};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6287272727272727, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.631, 500, 1500, "Get post 4"], "isController": false}, {"data": [0.638, 500, 1500, "Get post 5"], "isController": false}, {"data": [0.62, 500, 1500, "Get post 2"], "isController": false}, {"data": [0.623, 500, 1500, "Get post 3"], "isController": false}, {"data": [0.587, 500, 1500, "Get posts"], "isController": false}, {"data": [0.572, 500, 1500, "Get post 1"], "isController": false}, {"data": [0.662, 500, 1500, "Get post 10"], "isController": false}, {"data": [0.649, 500, 1500, "Get post 8"], "isController": false}, {"data": [0.649, 500, 1500, "Get post 9"], "isController": false}, {"data": [0.641, 500, 1500, "Get post 6"], "isController": false}, {"data": [0.644, 500, 1500, "Get post 7"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5500, 1988, 36.14545454545455, 447.40109090908976, 0, 310216, 96.0, 146.0, 250.7499999999991, 19247.989999999998, 15.101758393831892, 14.367258418200638, 1.2243123165479577], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get post 4", 500, 181, 36.2, 187.00400000000013, 45, 19267, 93.0, 139.0, 223.34999999999985, 774.8700000000019, 1.6689475616676124, 1.5091164956690812, 0.13517823316866384], "isController": false}, {"data": ["Get post 5", 500, 180, 36.0, 141.83600000000007, 47, 19264, 93.0, 140.0, 169.74999999999994, 468.5700000000004, 1.6689419909142797, 1.506526554118782, 0.13560153676178524], "isController": false}, {"data": ["Get post 2", 500, 189, 37.8, 412.3540000000003, 36, 19327, 93.0, 143.0, 215.84999999999997, 19261.98, 1.668936420198136, 1.5678973143057893, 0.13178730364963018], "isController": false}, {"data": ["Get post 3", 500, 186, 37.2, 282.1439999999997, 45, 19267, 94.0, 145.0, 222.64999999999992, 10220.990000000083, 1.668925278877414, 1.5457507702090163, 0.13305767555425008], "isController": false}, {"data": ["Get posts", 500, 198, 39.6, 419.4080000000003, 86, 19290, 132.0, 245.90000000000003, 612.8499999999999, 19263.84, 1.6689141377054433, 2.429358776068439, 0.12698741597017316], "isController": false}, {"data": ["Get post 1", 500, 190, 38.0, 1639.505999999999, 0, 43910, 98.0, 211.90000000000003, 7547.799999999994, 40437.97, 1.6689197082728349, 1.5696841778067057, 0.13136223485038134], "isController": false}, {"data": ["Get post 10", 500, 167, 33.4, 816.9319999999999, 45, 310216, 89.0, 131.90000000000003, 143.84999999999997, 1084.8700000000038, 1.3759776321076123, 1.173816418440302, 0.11723490672935621], "isController": false}, {"data": ["Get post 8", 500, 173, 34.6, 220.68800000000016, 0, 19283, 91.0, 143.7000000000001, 199.6499999999997, 533.8500000000001, 1.6687637464413614, 1.4766603573490686, 0.13855302121332475], "isController": false}, {"data": ["Get post 9", 500, 171, 34.2, 233.32799999999983, 43, 19283, 91.0, 141.90000000000003, 232.74999999999994, 1180.7600000000002, 1.6686802074503235, 1.451816963302385, 0.1393934618606452], "isController": false}, {"data": ["Get post 6", 500, 177, 35.4, 347.1580000000002, 47, 43908, 93.5, 137.0, 192.74999999999972, 19068.910000000164, 1.6689141377054433, 1.4939845554513411, 0.13687051687939758], "isController": false}, {"data": ["Get post 7", 500, 176, 35.2, 221.05399999999997, 46, 19283, 92.0, 142.80000000000007, 203.04999999999978, 634.0000000000009, 1.6688751447749188, 1.4903902518499481, 0.13729105683187418], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 1947, 97.93762575452716, 35.4], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 41, 2.062374245472837, 0.7454545454545455], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5500, 1988, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 1947, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 41, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get post 4", 500, 181, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 179, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 5", 500, 180, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 179, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 2", 500, 189, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 181, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 8, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 3", 500, 186, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 182, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 4, "", "", "", "", "", ""], "isController": false}, {"data": ["Get posts", 500, 198, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 192, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 6, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 1", 500, 190, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 186, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 4, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 10", 500, 167, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 164, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 8", 500, 173, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 170, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 9", 500, 171, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 168, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 6", 500, 177, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 173, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 4, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 7", 500, 176, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 173, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
