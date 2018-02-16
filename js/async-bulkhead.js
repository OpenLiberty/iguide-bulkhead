/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
var asyncBulkhead = function(){

    var _asyncBulkhead = function(root, stepName, value, waitingTaskQueue){
        this.root = root; // Root element that this asyncBulkhead is in
        this.stepName = stepName;
        this.updateParameters(value, waitingTaskQueue);
    };    

    _asyncBulkhead.prototype = {
      
      // Update the parameters
      updateParameters: function(value, waitingTaskQueue) {
        this.value = value ? value : 10;
        this.waitingTaskQueue = waitingTaskQueue ? waitingTaskQueue : 10;

        // Additional counters needed
        this.requestChatCount = 0;
//        this.requestQueue = [];
//        this.waitingQueue = [];

        this.updateCounters();
      },

      addRequestSquares: function(requestContainer, waitQueueContainer) {
        // this.requestChatCount = total number of unhandled requests made
        // this.value = @Bulkhead parameter - number of concurrent threads
        //                                    to handle requests.
        // this.waitingTaskQueue = @Bulkhead parameter - size of the wait
        //                                    queue.
        
        var requestCount = 0; // Tracks number of requests displayed on queues
        for (requestCount = 0; requestCount < this.requestChatCount && requestCount < this.value; requestCount++) {
          // Reminder: this.value is the size of the request queue
          var div = $("<div>");
          div.addClass('box threadpoolBoxInUse');
          requestContainer.append(div);
        }

        if (requestCount === this.requestChatCount && requestCount < this.value) {
          // The request queue is not full. Add empty squares to the request queue.
          // Reminder:  this.value === size of the request queue
          var emptyRequestSquares;
          for (emptyRequestSquares = requestCount; emptyRequestSquares < this.value; emptyRequestSquares++) {
            var div = $("<div>");
            div.addClass('box threadpoolBox');
            requestContainer.append(div);
          }
          // No requests for the wait queue.  Fill with empty boxes.
          for (emptyRequestSquares = 0; emptyRequestSquares < this.waitingTaskQueue; emptyRequestSquares++) {
            var div = $("<div>");
            div.addClass('box waitingTaskBox');
            waitQueueContainer.append(div);
          }
        } else if (requestCount < this.requestChatCount) {
          // There are more requests to display.  Spill them over to the wait queue.
          var waitRequestCount;
          for (waitRequestCount = 0; 
               requestCount < this.requestChatCount && waitRequestCount < this.waitingTaskQueue;
               requestCount++, waitRequestCount++) {
            var divEmpty = $("div");
            div.addClass('box waitingTaskBoxInUse');
            waitQueueContainer.append(div);  
          }
          if (requestCount !== this.requestChatCount) {
            // Still requests that haven't been processed.  Issue exception.
            // ********************************** //
            console.error("issue bulkhead exception");
          } else {
            // The wait queue is not full.  Add empty boxes to the wait queue.
            for ( ; waitRequestCount < this.waitingTaskQueue; waitRequestCount++) {
              var divEmpty = $("div");
              div.addClass('box waitingTaskBox');
              waitQueueContainer.append(div);                  
            }
          }
        } 
      },

      /*
        Update the counters in the Async Bulkhead pod
      */
      updateCounters: function() {
          // Display request queue
          var requestQueue = this.root.find(".bulkheadThreadpoolQueue");
          var waitingTasksQueue = this.root.find(".bulkheadWaitQueue");

          requestQueue.empty();
          waitingTasksQueue.empty();

          requestQueue.append("[");
          waitingTasksQueue.append("[");
          this.addRequestSquares(requestQueue, waitingTasksQueue);
          requestQueue.append("]");
          waitingTasksQueue.append("]");

          var requestQueueSize = (this.requestChatCount < this.value ? this.value-this.requestChatCount : this.value); 
          var waitQueueSize = 0;
          if (requestQueueSize === this.value) {
            // Filled the request queue.  Look for wait queue values.
            if ((requestQueueSize + this.waitingTaskQueue) <= this.requestChatCount) {
              waitQueueSize = this.requestChatCount - requestQueueSize;
            } else {
              waitQueueSize = this.requestChatCount;
            }
          }

          // Update request queue aria-label with the number of requests
          requestQueue.attr('aria-label', 'Number of requested threads: ' + requestQueueSize + '. Size of threadpool: ' + this.value);

          // Update waiting task queue aria-label with the number of requests
          waitingTasksQueue.attr('aria-label', 'Number of waiting threads: ' + waitQueueSize + '. Size of waiting task queue: ' + this.waitingTaskQueue);        
      },

      // Handle chat request and end chat requests
      handleRequest: function(startChat){
        if (startChat) {
          this.requestChatCount++;
        } else {
          this.requestChatCount = this.requestChatCount > 0 ? this.requestChatCount-- : 0;
        }
      },

      // Handles a successful request to the microservice
      sendStartChatRequest: function() {
        this.handleRequest(true);            
        this.updateCounters();
      },      

      // Handles a failed request to the microservice
      sendEndChatRequest: function() {
        this.handleRequest(false);            
        this.updateCounters();
      }
    };

    var _create = function(root, stepName, value, waitingTaskQueue){
      return new _asyncBulkhead(root, stepName, value, waitingTaskQueue);
    };

    return {
        create: _create
    };
}();
