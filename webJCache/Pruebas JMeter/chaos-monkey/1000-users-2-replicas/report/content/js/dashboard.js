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

    var data = {"OkPercent": 51.845454545454544, "KoPercent": 48.154545454545456};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5147272727272727, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.511, 500, 1500, "Get post 4"], "isController": false}, {"data": [0.5195, 500, 1500, "Get post 5"], "isController": false}, {"data": [0.51, 500, 1500, "Get post 2"], "isController": false}, {"data": [0.512, 500, 1500, "Get post 3"], "isController": false}, {"data": [0.483, 500, 1500, "Get posts"], "isController": false}, {"data": [0.4945, 500, 1500, "Get post 1"], "isController": false}, {"data": [0.533, 500, 1500, "Get post 10"], "isController": false}, {"data": [0.528, 500, 1500, "Get post 8"], "isController": false}, {"data": [0.529, 500, 1500, "Get post 9"], "isController": false}, {"data": [0.519, 500, 1500, "Get post 6"], "isController": false}, {"data": [0.523, 500, 1500, "Get post 7"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11000, 5297, 48.154545454545456, 333.23318181818144, 42, 54070, 88.0, 126.0, 144.0, 9273.019999999935, 36.278008271385886, 42.05812497011187, 2.387903917488968], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get post 4", 1000, 484, 48.4, 509.3129999999998, 42, 53853, 86.0, 126.0, 148.89999999999986, 19267.96, 3.3527232494593733, 3.7789185476841065, 0.21962956598997538], "isController": false}, {"data": ["Get post 5", 1000, 480, 48.0, 200.8270000000001, 42, 19291, 87.0, 124.0, 138.0, 445.5700000000004, 3.3536115042289043, 3.7552719820850076, 0.22139075945886127], "isController": false}, {"data": ["Get post 2", 1000, 489, 48.9, 207.6200000000001, 42, 19289, 87.0, 123.0, 140.94999999999993, 425.99, 3.3524085379140645, 3.799598229551146, 0.21748095622424932], "isController": false}, {"data": ["Get post 3", 1000, 488, 48.8, 217.4189999999999, 42, 19321, 86.0, 120.0, 135.89999999999986, 396.85000000000014, 3.352880627391023, 3.8009551413909763, 0.2179372407804165], "isController": false}, {"data": ["Get posts", 1000, 498, 49.8, 1109.2340000000013, 82, 53863, 101.0, 158.89999999999998, 437.4499999999979, 51165.94, 3.335501409249346, 5.199779596320941, 0.2109378908790714], "isController": false}, {"data": ["Get post 1", 1000, 494, 49.4, 335.83600000000007, 44, 19338, 87.0, 127.89999999999998, 169.89999999999986, 9881.090000000002, 3.351520920193584, 3.837281983564141, 0.21529594348665423], "isController": false}, {"data": ["Get post 10", 1000, 465, 46.5, 237.92500000000018, 44, 19337, 85.5, 122.0, 137.0, 1100.6800000000057, 3.3268681196208703, 3.6238430816114016, 0.2276987814097936], "isController": false}, {"data": ["Get post 8", 1000, 472, 47.2, 217.1160000000001, 43, 19289, 87.0, 125.0, 138.94999999999993, 358.95000000000005, 3.3269898726428275, 3.693316150123764, 0.22301228990058955], "isController": false}, {"data": ["Get post 9", 1000, 471, 47.1, 237.2280000000001, 43, 19403, 84.0, 121.89999999999998, 136.0, 468.97, 3.3267574427880886, 3.6683023743899557, 0.22341905209036803], "isController": false}, {"data": ["Get post 6", 1000, 479, 47.9, 176.00399999999993, 43, 54070, 85.0, 118.89999999999998, 132.94999999999993, 386.82000000000016, 3.3532179155726793, 3.7415690146736815, 0.22179047795091558], "isController": false}, {"data": ["Get post 7", 1000, 477, 47.7, 217.04299999999995, 43, 19285, 85.0, 124.0, 133.94999999999993, 381.95000000000005, 3.353296625912935, 3.7455668370700237, 0.22264710702716842], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 5212, 98.3953181045875, 47.38181818181818], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 85, 1.6046818954124977, 0.7727272727272727], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11000, 5297, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 5212, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 85, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get post 4", 1000, 484, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 473, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 11, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 5", 1000, 480, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 474, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 6, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 2", 1000, 489, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 483, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 6, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 3", 1000, 488, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 481, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 7, "", "", "", "", "", ""], "isController": false}, {"data": ["Get posts", 1000, 498, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 482, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 16, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 1", 1000, 494, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 486, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 8, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 10", 1000, 465, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 458, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 7, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 8", 1000, 472, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 465, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 7, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 9", 1000, 471, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 463, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 8, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 6", 1000, 479, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 477, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["Get post 7", 1000, 477, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 167.235.216.118:8080 failed to respond", 470, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 7, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
