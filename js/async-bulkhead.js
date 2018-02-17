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
        this.root = root;     // Root element that this asyncBulkhead is in
        this.stepName = stepName;
        this.updateParameters(value, waitingTaskQueue);
    };    

    _asyncBulkhead.prototype = {
      
      // Update the parameters
      updateParameters: function(value, waitingTaskQueue) {
        this.value = value ? value : 10;
        this.waitingTaskQueue = waitingTaskQueue ? waitingTaskQueue : 10;

        // Initialize chat request processed count
        this.requestChatCount = 0;

        this.updateQueues();
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
          $("<div>").attr({'class': "box threadpoolBoxInUse"}).appendTo(requestContainer);
        }

        if (requestCount === this.requestChatCount && requestCount < this.value) {
          // The request queue is not full. Add empty squares to the request queue.
          // Reminder:  this.value === size of the request queue
          var emptyRequestSquares;
          for (emptyRequestSquares = requestCount; emptyRequestSquares < this.value; emptyRequestSquares++) {
            $("<div>").attr({'class': "box threadpoolBox"}).appendTo(requestContainer);
          }
          // No requests for the wait queue.  Fill with empty boxes.
          for (emptyRequestSquares = 0; emptyRequestSquares < this.waitingTaskQueue; emptyRequestSquares++) {
            $("<div>").attr({'class': "box waitingTaskBox"}).appendTo(waitQueueContainer);
          }
        } else if (requestCount <= this.requestChatCount) {
          // There are more requests to display.  Spill them over to the wait queue.
          var waitRequestCount;
          for (waitRequestCount = 0; 
               requestCount < this.requestChatCount && waitRequestCount < this.waitingTaskQueue;
               requestCount++, waitRequestCount++) {
            $("<div>").attr({'class': "box waitingTaskBoxInUse"}).appendTo(waitQueueContainer);  
          }
          if (requestCount !== this.requestChatCount) {
            // Still requests that haven't been processed.  Issue BulkheadException.
            this.requestChatCount = this.value + this.waitingTaskQueue;  // Reset the requestChatCount to maximum
                                                                         // so end request won't process requests
                                                                         // that were rejected.
            this.root.find(".bulkheadDescriptionDiv").show();
          } else {
            this.root.find(".bulkheadDescriptionDiv").hide();
            // The wait queue is not full.  Add empty boxes to the wait queue.
            for ( ; waitRequestCount < this.waitingTaskQueue; waitRequestCount++) {
              $("<div>").attr({'class': "box waitingTaskBox"}).appendTo(waitQueueContainer);          
            }
          }
        } 
      },

      /*
        Update the queues displayed in the Async Bulkhead pod
      */
      updateQueues: function() {
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
            if ((requestQueueSize + this.waitingTaskQueue) >= this.requestChatCount) {
              waitQueueSize = this.requestChatCount - requestQueueSize;
            } else {
              waitQueueSize = this.requestChatCount;
            }
          }

          // Update request queue aria-label with the number of requests on the queue.
          requestQueue.attr('aria-label', 'Number of requested threads: ' + requestQueueSize + '. Size of threadpool: ' + this.value);

          // Update waiting task queue aria-label with the number of requests on the waiting queue.
          waitingTasksQueue.attr('aria-label', 'Number of waiting threads: ' + waitQueueSize + '. Size of waiting task queue: ' + this.waitingTaskQueue);        
      },

      // Handle chat request and end chat requests
      handleRequest: function(startChat){
        if (startChat) {
          this.requestChatCount++;
        } else {
          // end chat selected
          if (this.requestChatCount > 0) {
            this.requestChatCount--;
          } else {
            this.requestChatCount = 0;
          }
        }
      },

      // Handles a successful chat request to the microservice
      sendStartChatRequest: function() {
        this.handleRequest(true);            
        this.updateQueues();
      },      

      // Handles a request to end a chat session
      sendEndChatRequest: function() {
        this.handleRequest(false);            
        this.updateQueues();
      },

      // Reset the request and waiting queues so they are empty.
      resetQueues: function() {
        this.requestChatCount = 0;
        this.updateQueues();
        this.root.find(".bulkheadDescriptionDiv").hide();
      }
    };

    var _create = function(root, stepName, value, waitingTaskQueue){
      return new _asyncBulkhead(root, stepName, value, waitingTaskQueue);
    };

    return {
        create: _create
    };
}();
