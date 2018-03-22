/** 
  Copyright (c) 2018 IBM Corporation and others.
  All rights reserved. This program and the accompanying materials
  are made available under the terms of the Eclipse Public License v1.0
  which accompanies this distribution, and is available at
  http://www.eclipse.org/legal/epl-v10.html
 
  Contributors:
      IBM Corporation - initial API and implementation
*/
document.getElementById("redirectToVFA").onclick();
    
function redirectToVFA (e) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById('content').innerHTML = request.responseText;
            // hide ... msg
            document.getElementById('connecting').style.display='none';
        } else if (this.readyState == 4) {
            document.getElementById("content").innerHTML = "<h3 style='align:center;'>No vfa could be retrieved</h3>";
        }
    };
    request.open("GET", "/bulkheadSample/Bank/vfa", true);
    request.setRequestHeader('Content-type', 'text/html');
    request.send();
};

function timeCheck(value) {
    document.getElementById('scheduleSubmitButton').disabled = false;
};
 
function submitSchedule() {
    document.getElementById('formContent').style.display = 'none';
    document.getElementById('formResponse').style.display = 'block';
};