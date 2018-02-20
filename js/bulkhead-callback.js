/*******************************************************************************
* Copyright (c) 2017 IBM Corporation and others.
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*
* Contributors:
*     IBM Corporation - initial API and implementation
*******************************************************************************/
var bulkheadCallBack = (function() {

    var bankServiceFileName = "BankService.java";
  
    /** AddLibertyMPFaultTolerance step  begin */
    var addMicroProfileFaultToleranceFeatureButton = function(event) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addMicroProfileFaultToleranceFeature();
        }
    };

    var __addMicroProfileFaultToleranceFeature = function() {
        var FTFeature = "      <feature>mpFaultTolerance-1.0</feature>";
        var stepName = stepContent.getCurrentStepName();
        // reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.resetEditorContents(stepName);
        var content = contentManager.getEditorContents(stepName);

        contentManager.insertEditorContents(stepName, 5, FTFeature);
        var readOnlyLines = [];
        // mark cdi feature line readonly
        readOnlyLines.push({
            from: 4,
            to: 4
        });
        contentManager.markEditorReadOnlyLines(stepName, readOnlyLines);
    };

    var __getMicroProfileFaultToleranceFeatureContent = function(content) {
        var editorContents = {};
        try {
            // match
            // <featureManager>
            //    <anything here>
            // </featureManager>
            // and capturing groups to get content before featureManager, the feature, and after
            // featureManager content.
            var featureManagerToMatch = "([\\s\\S]*)<featureManager>([\\s\\S]*)<\\/featureManager>([\\s\\S]*)";
            var regExpToMatch = new RegExp(featureManagerToMatch, "g");
            var groups = regExpToMatch.exec(content);
            editorContents.beforeFeature = groups[1];
            editorContents.features = groups[2];
            editorContents.afterFeature = groups[3];
        }
        catch (e) {
        }
        return editorContents;
    };

     var __isFaultToleranceInFeatures = function(features) {
        var match = false;
        features = features.replace('\n', '');
        features = features.replace(/\s/g, ''); // Remove whitespace
        try {
            var featureMatches = features.match(/<feature>[\s\S]*?<\/feature>/g);
            $(featureMatches).each(function (index, feature) {
                if (feature.indexOf("<feature>mpFaultTolerance-1.0</feature>") !== -1) {
                    match = true;
                    return false; // break out of each loop
                }
            });
        }
        catch (e) {
        }
        return match;
    };

    var __isCDIInFeatures = function(features) {
        var match = false;
        var features = features.replace('\n', '');
        features = features.replace(/\s/g, ''); // Remove whitespace
        try {
            var featureMatches = features.match(/<feature>[\s\S]*?<\/feature>/g);
            $(featureMatches).each(function (index, feature) {
                if (feature.indexOf("<feature>cdi-1.2</feature>") !== -1) {
                    match = true;
                    return false; // break out of each loop
                }
            });
        }
        catch (e) {
        }
        return match;
    };

    var __checkMicroProfileFaultToleranceFeatureContent = function(content) {
        var isFTFeatureThere = true;
        var editorContentBreakdown = __getMicroProfileFaultToleranceFeatureContent(content);
        if (editorContentBreakdown.hasOwnProperty("features")) {
            isFTFeatureThere =  __isFaultToleranceInFeatures(editorContentBreakdown.features) &&
                                __isCDIInFeatures(editorContentBreakdown.features);
            if (isFTFeatureThere) {
                // check for whether other stuffs are there
                var features = editorContentBreakdown.features;
                features = features.replace('\n', '');
                features = features.replace(/\s/g, '');
                if (features.length !== "<feature>mpFaultTolerance-1.0</feature><feature>cdi-1.2</feature>".length) {
                    isFTFeatureThere = false; // contains extra text
                }
            }
        } else {
            isFTFeatureThere = false;
        }
        return isFTFeatureThere;
    };

    var __setMicroProfileFaultToleranceFeatureContent = function(stepName, content) {
        var FTFeature = "   <feature>mpFaultTolerance-1.0</feature>\n   ";
        var editorContentBreakdown = __getMicroProfileFaultToleranceFeatureContent(content);
        __closeErrorBoxEditor(stepName);
        if (editorContentBreakdown.hasOwnProperty("features")) {
            var isFTFeatureThere = __isFaultToleranceInFeatures(editorContentBreakdown.features);
            if (isFTFeatureThere === false) { // attempt to fix it
                var newContent = editorContentBreakdown.beforeFeature + "<featureManager>" + editorContentBreakdown.features + FTFeature + "</featureManager>" + editorContentBreakdown.afterFeature;
                contentManager.setEditorContents(stepName, newContent);
            }
        } else {
            indexOfFeatureMgr = content.indexOf("featureManager");
            indexOfFeature = content.indexOf("feature");
            indexOfEndpoint = content.indexOf("<httpEndpoint");
            if (indexOfFeatureMgr === -1 && indexOfFeature === -1 && indexOfEndpoint !== -1) {
                var beforeEndpointContent = content.substring(0, indexOfEndpoint);
                var afterEndpointContent = content.substring(indexOfEndpoint);
                var newContent = beforeEndpointContent.trim() + "\n   <featureManager>\n   " + FTFeature + "</featureManager>\n   " + afterEndpointContent;
                contentManager.setEditorContents(stepName, newContent);
            } else {
                // display error

                editor.createErrorLinkForCallBack(true, __correctEditorError);
            }
        }
    };

    var __saveServerXML = function(editor) {
        var stepName = stepContent.getCurrentStepName();
        var content = contentManager.getEditorContents(stepName);
        if (__checkMicroProfileFaultToleranceFeatureContent(content)) {
            editor.closeEditorErrorBox(stepName);
            var stepName = stepContent.getCurrentStepName();
            contentManager.markCurrentInstructionComplete(stepName);
        } else {
            // display error to fix it
            editor.createErrorLinkForCallBack(true, __correctEditorError);
        }
    };

    var __listenToEditorForFeatureInServerXML = function(editor) {
        var saveServerXML = function(editor) {
            __saveServerXML(editor);
        };
        editor.addSaveListener(saveServerXML);
    };

    var saveServerXMLButton = function(event) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            contentManager.saveEditor(stepContent.getCurrentStepName());
            // __saveServerXML();
        }
    };
    /** AddLibertyMPFaultTolerance step  end */

    var __saveButtonEditor = function(stepName) {
        contentManager.saveTabbedEditor(stepName, bankServiceFileName);
    };

    var saveButtonEditorButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __saveButtonEditor(stepName);
        }
    };

    var __showPodWithRequestButtonAndBrowser = function(editor) {
        var stepName = editor.getStepName();
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        
        var htmlFile;
        if (stepName === "AsyncWithoutBulkhead") {
            htmlFile = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-async-without-bulkhead.html";
        } else if (stepName === "BulkheadAnnotation") {
            htmlFile = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-bulkhead.html";
        } else if (stepName === "AsyncBulkheadAnnotation") {
            htmlFile = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-asyncbulkhead.html";
        } else if (stepName === "Fallback") {
            htmlFile = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-asyncbulkhead-fallback.html";
        } 

        if (__checkEditorContent(stepName, content)) {
            //editor.closeEditorErrorBox(stepName);
            var index = contentManager.getCurrentInstructionIndex();
            if(index === 0){
                contentManager.markCurrentInstructionComplete(stepName);
                contentManager.updateWithNewInstructionNoMarkComplete(stepName);
                // display the pod with chat button and web browser in it
                contentManager.setPodContent(stepName, htmlFile);
                    //"/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-new-session.html");
            }
        } else {
            // display error and provide link to fix it
            editor.createErrorLinkForCallBack(true, __correctEditorError);
        }
    };  
    
    var __checkEditorContent = function(stepName, content) {
        var contentIsCorrect = true;
        if (stepName === "AsyncWithoutBulkhead") {
            // to be implemented
        } else if (stepName === "AsyncBulkheadAnnotation") {

        }
        return contentIsCorrect;
    };

    var __correctEditorError = function(stepName) {
        if (stepName === "AsyncWithoutBulkhead") {
            __addJavaConcurrencyInEditor(stepName);
        }else if (stepName === "AddLibertyMPFaultTolerance") {
            __addMicroProfileFaultToleranceFeature();        
        }
    };

    var listenToEditorForJavaConcurrency = function(editor) {       
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    };

    var __addJavaConcurrencyInEditor = function(stepName) {
        // reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = 
            "    ExecutorService executor = Executors.newFixedThreadPool(1);\n" +
            "    Future serviceRequest = executor.submit(() -> {\n" + 
            "      try {\n" +
            "        return serviceForVFA(counterForVFA);\n" +
            "      } catch {Exception ex} {\n" + 
            "        handleException();\n" +
            "      }\n" +
            "      return null;\n" +
            "    });";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 12, 12, newContent, 9);
    };

    var listenToEditorForBulkheadAnnotation = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    }

    var __addBulkheadInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "  @Bulkhead(50)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 22, 22, newContent, 1);
    }

    var addJavaConcurrencyButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addJavaConcurrencyInEditor(stepName);
        }
    };

    var addBulkheadButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            __addBulkheadInEditor(stepName);
        }
    };

    var clickChat = function(event, stepName) {
        if (stepName === "AsyncWithoutBulkhead") {
            $('#asyncWithoutBulkheadStep').find('.newSessionButton').trigger('click');
        } else if (stepName === 'BulkheadAnnotation') {
            $('#bulkheadStep').find('.newSessionButton').trigger('click');
        } else if (stepName === "AsyncBulkheadAnnotation") {
            $('#asyncBulkheadStep').find('.newSessionButton').trigger('click');  
        } else if (stepName === 'Fallback') {
            $('#asyncBulkheadFallbackStep').find('.newSessionButton').trigger('click'); 
        } else if (stepName = "FinancialAdvisor") {
            $('#financialAdvisorStep').find('.newSessionButton').trigger('click');
        }
    };

    var addAsyncBulkheadButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addAsyncBulkheadInEditor(stepName);
           }
    };

    var __addAsyncBulkheadInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        //var newContent =
        //    "    @Asynchronous\n"; + 
        //    "    @Bulkhead(value = 2, waitingTaskQueue = 1)";
        //contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 9, 9, newContent, 2);

        //var newContent = 
        //    "  @Asynchronous";
        //contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 9, 9, newContent, 1);

        var params = [];
        var constructAnnotation = function(params) {
            var bulkheadAnnotation = "  @Asynchronous\n" +
                                     "  @Bulkhead(";
            if ($.isArray(params) && params.length > 0) {
                bulkheadAnnotation += params.join(",\n            ");
            }
            bulkheadAnnotation += ")";
            return bulkheadAnnotation;
        };

        params[0] = "value=50";
        params[1] = "waitingTaskQueue=50";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 24, 24, constructAnnotation(params), 3);
        var readOnlyLines = [];
        readOnlyLines.push({from: 24, to: 24});
        contentManager.markTabbedEditorReadOnlyLines(stepName, bankServiceFileName, readOnlyLines);
    };

    var addMethodFutureReturnTypeButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addMethodFutureReturnTypeInEditor(stepName);
        }        
    };

    var __addMethodFutureReturnTypeInEditor = function(stepName, performReset) {
        /*var hasAsyncAnnotation;
        var hasReturnType;
        if (performReset === undefined || performReset) {
            var content = contentManager.getEditorContents(stepName);
            hasAsyncAnnotation = __checkAsyncAnnotation(content);
            hasReturnType = __checkReturnType(content); 
            contentManager.resetEditorContents(stepName); 
        }*/
        var returnMethodType = 
            "  public Future<Service> serviceForVFA(int counterForVFA) {";
        var readOnlyLines = [];
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 27, 27, returnMethodType, 1);      
        readOnlyLines.push({from: 27, to: 27});
        //readOnlyLines.push({from: 1, to: 8}, {from: 12, to: 16});
        contentManager.markTabbedEditorReadOnlyLines(stepName, bankServiceFileName, readOnlyLines);
        /*
        if (hasAsyncAnnotation) {
            __addAsyncBulkheadInEditor(stepName);
        }
        if (hasReturnType) {
            __addReturnTypeInEditor(stepName);
        }*/
    };

    var __addReturnTypeInEditor = function(stepName, performReset) {
        //var content = contentManager.getEditorContents(stepName);
        var newReturnType = 
            "    return CompletableFuture.completedFuture(chatService);";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 29, 29, newReturnType, 1);
        var readOnlyLines = [];
        readOnlyLines.push({from: 29, to: 29});
        contentManager.markTabbedEditorReadOnlyLines(stepName, bankServiceFileName, readOnlyLines);
    };

    var addReturnTypeButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addReturnTypeInEditor(stepName);
        }        
    };

    var listenToEditorForAsyncBulkhead = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    }

    var addFallbackAsyncBulkheadButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addFallbackAsyncBulkheadInEditor(stepName);
        }
    };

    var __addFallbackAsyncBulkheadInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var newContent =
            "  @Fallback(ServiceFallbackHandler.class)"; + 
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 16, 16, newContent, 1);

        //var readOnlyLines = [];
        //readOnlyLines.push({from: 1, to: 10}, {from: 13, to: 16});
        //contentManager.markTabbedEditorReadOnlyLines(stepName, bankServiceFileName, readOnlyLines);
    };

    var listenToEditorForAsyncBulkheadFallback = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    }

    var updateAsyncBulkheadMethodButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __updateAsyncBulkheadMethodButtonInEditor(stepName);
        }
    };

    var __updateAsyncBulkheadMethodButtonInEditor = function(stepName) {
        //contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "  public Future<Service> requestForVFA() {\n" +
                         "    counterForVFA++;\n" + 
                         "    return serviceForVFA(counterForVFA);\n" +
                         "  }";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 11, 22, newContent, 10);
        var readOnlyLines = [];
        readOnlyLines.push({from: 11, to: 14});
        contentManager.markTabbedEditorReadOnlyLines(stepName, bankServiceFileName, readOnlyLines);
    };

    var __browserVirtualAdvisorBaseURL = "https://global-ebank.openliberty.io/virtualFinancialAdvisor/";
    var __advisors = ["Bob", "Jenny", "John", "Mary", "Lee", "Mike", "Sam", "Sandy", "Joann", "Frank" ];
    var __advisorColors = ['royalblue', 'gray', 'seagreen'];
    var handleNewChatRequestInBrowser = function(stepName, browser, stepElementId, requestNum) {
        var browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-chat.html";  
        var browserUrl = __browserVirtualAdvisorBaseURL + "Advisor" + requestNum;
        var browserErrorUrl = __browserVirtualAdvisorBaseURL + "error";
        var requestLimits = 1;

        contentManager.markCurrentInstructionComplete(stepName);
        contentManager.updateWithNewInstructionNoMarkComplete(stepName);
        if (stepName === "AsyncWithoutBulkhead") { 
            requestLimits = 3;     
            if (requestNum === 1) {
                $("#" + stepElementId).find(".chatText").text('Customer2 requests chat');
            } else if (requestNum === 2) {
                $("#" + stepElementId).find(".chatText").text('Customer100 requests chat');
            }
            else if (requestNum >= requestLimits) {
                browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-error-503.html";
                browserUrl = browserErrorUrl;
                //statusBarMessage = "Error";
            }             
        } else if (stepName === "FinancialAdvisor") {
            requestLimits = 2;
            if (requestNum === 1) {
                $("#" + stepElementId).find(".chatText").text('Customer2 requests chat');
            } else if (requestNum >= requestLimits) {
                browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-no-available.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName == "BulkheadAnnotation") {
            requestLimits = 2;
            if (requestNum === 1) {
                $("#" + stepElementId).find(".chatText").text('Customer51 requests chat');
            } else if (requestNum >= requestLimits) {
                browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-bulkhead-error.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "AsyncBulkheadAnnotation") {
            requestLimits = 2;
            if (requestNum === 1) {
                $("#" + stepElementId).find(".chatText").text('Customer51 requests chat');
            } else if (requestNum === 2) { 
                $("#" + stepElementId).find(".chatText").text('Customer101 requests chat');
                browserUrl = __browserVirtualAdvisorBaseURL + "waitingqueue";        
                browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-waitingqueue.html";
            } else if (requestNum >= 3) {
                browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-bulkhead-error.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "Fallback") {
            requestLimits = 2;
            if (requestNum === 1) {
                $("#" + stepElementId).find(".chatText").text('Customer51 requests chat');
            } else if (requestNum === 2) { 
                $("#" + stepElementId).find(".chatText").text('Customer101 requests chat');
                browserUrl =  __browserVirtualAdvisorBaseURL + "waitingqueue";        
                browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-waitingqueue.html";
            } else if (requestNum >= 3) {
                browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-fallback.html";
                browserUrl = __browserVirtualAdvisorBaseURL + "fallback";
            }  
        }

        contentManager.setBrowserURL(stepName, browserUrl, 0); 
        browser.setBrowserContent(browserContentHTML);       
        if (requestNum < requestLimits) {
            // timeout is needed to make sure the content is rendered before accessing the elements
            setTimeout(function (numOfRequest) {
                var advisor = __advisors[requestNum - 1];
                var advisorBackgroundColor = __advisorColors[requestNum - 1];
                var chatAdvisorCount  = "You are talking to advisor #" + numOfRequests;
                var chatIntro = "Hi, I am " + advisor + ", a financial advisor from Global eBank. Let me review your account. I'll be with you shortly."
                browser.getIframeDOM().find(".chatAdvisorCount").text(chatAdvisorCount);
                browser.getIframeDOM().find(".advisor").css("background-color", advisorBackgroundColor);
                browser.getIframeDOM().find(".advisor").text(chatIntro);
            }, 200);
        }
    };
    var __listenToPlaygroundEditorAnnotationChanges = function(editor){
        var __listenToContentChanges = function(editorInstance, changes) {
            // Get pod from contentManager
            var cb = contentManager.getPlayground(editor.getStepName());            
            // Get the parameters from the editor and send to the circuitBreaker
            var content = editor.getEditorContent();
            try{
                var matchPattern = "public class BankService\\s*{\\s*@CircuitBreaker\\s*\\((([^\\(\\)])*?)\\)\\s*public Service checkBalance";
                var regexToMatch = new RegExp(matchPattern, "g");
                var groups = regexToMatch.exec(content);
                var annotation = groups[1];

                var params = annotation.replace(/[{\s()}]/g, ''); // Remove whitespace and parenthesis
                params = params.split(',');

                var requestVolumeThreshold;
                var failureThreshold;
                var delay;
                var successThreshold;       

                // Parse their annotation for values
                params.forEach(function(param, index){
                if (param.indexOf('requestVolumeThreshold=') > -1){
                    requestVolumeThreshold = param.substring(param.indexOf('requestVolumeThreshold=') + 23);
                }                    
                if (param.indexOf('failureRatio=') > -1){
                    failureThreshold = param.substring(param.indexOf('failureRatio=') + 13);
                }                    
                if (param.indexOf('delay=') > -1){
                    delay = param.substring(param.indexOf('delay=') + 6);
                }                    
                if (param.indexOf('successThreshold=') > -1){
                    successThreshold = param.substring(param.indexOf('successThreshold=') + 17);
                }  
                });              
                // Apply the annotation values to the circuit breaker. If one is not specified, the value will be undefined and circuit breaker will use its default value
                cb.updateParameters.apply(cb, [requestVolumeThreshold, failureThreshold, delay, successThreshold]);
            }
            catch(e){

            }
        }
        editor.addSaveListener(__listenToContentChanges);
        editor.addContentChangeListener(__listenToContentChanges);
    };

    var __createAsyncBulkhead = function(root, stepName) {
        // If root is not a jQuery element, get the jQuery element from the root object passed in
        if(!root.selector){
            root = root.contentRootElement;
        }

        //  TODO: change 10, 5 to actual values from the code!
        var ab = asyncBulkhead.create(root, stepName, 10, 5); 
        root.asyncBulkhead = ab;

        root.find(".bulkheadThreadRequestButton").on("click", function(){
            ab.sendStartChatRequest();
        });
        root.find(".bulkheadThreadReleaseButton").on("click", function(){
            ab.sendEndChatRequest();
        });
        root.find(".bulkheadResetButton").on("click", function(){
            ab.resetQueues();
        });
        contentManager.setPlayground(stepName, ab, 0);
    };


    return {
        listenToEditorForFeatureInServerXML: __listenToEditorForFeatureInServerXML,
        addMicroProfileFaultToleranceFeatureButton: addMicroProfileFaultToleranceFeatureButton,
        saveServerXMLButton: saveServerXMLButton,
        addJavaConcurrencyButton: addJavaConcurrencyButton,
        addBulkheadButton: addBulkheadButton,
        saveButtonEditorButton: saveButtonEditorButton,
        listenToEditorForJavaConcurrency: listenToEditorForJavaConcurrency,
        clickChat: clickChat,
        listenToEditorForAsyncBulkhead: listenToEditorForAsyncBulkhead,
        addAsyncBulkheadButton: addAsyncBulkheadButton,
        addReturnTypeButton: addReturnTypeButton,
        addMethodFutureReturnTypeButton: addMethodFutureReturnTypeButton,
        addFallbackAsyncBulkheadButton: addFallbackAsyncBulkheadButton,
        listenToEditorForAsyncBulkheadFallback: listenToEditorForAsyncBulkheadFallback,
        handleNewChatRequestInBrowser: handleNewChatRequestInBrowser,
        updateAsyncBulkheadMethodButton: updateAsyncBulkheadMethodButton,
        listenToPlaygroundEditorAnnotationChanges: __listenToPlaygroundEditorAnnotationChanges,
        createAsyncBulkhead: __createAsyncBulkhead
    };

})();
