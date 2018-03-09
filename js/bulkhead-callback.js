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
        var serverFileName = "server.xml";

        // reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.resetTabbedEditorContents(stepName, serverFileName);
        var content = contentManager.getTabbedEditorContents(stepName, serverFileName);

        contentManager.insertTabbedEditorContents(stepName, serverFileName, 5, FTFeature);
        var readOnlyLines = [];
        // mark cdi feature line readonly
        readOnlyLines.push({
            from: 4,
            to: 4
        });
        contentManager.markTabbedEditorReadOnlyLines(stepName, serverFileName, readOnlyLines);
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
        features = features.replace('\n', '');
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

    var __saveServerXML = function(editor) {
        var stepName = stepContent.getCurrentStepName();
        var serverFileName = "server.xml";

        var content = contentManager.getTabbedEditorContents(stepName, serverFileName);
        if (__checkMicroProfileFaultToleranceFeatureContent(content)) {
            editor.closeEditorErrorBox(stepName);
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
            contentManager.saveTabbedEditor(stepContent.getCurrentStepName(), "server.xml");
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
            editor.closeEditorErrorBox(stepName);
            var index = contentManager.getCurrentInstructionIndex();
            if(index === 0){
                contentManager.markCurrentInstructionComplete(stepName);
                contentManager.updateWithNewInstructionNoMarkComplete(stepName);
                // display the pod with chat button and web browser in it
                contentManager.setPodContent(stepName, htmlFile);
                    //"/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-new-session.html");
                // resize the height of the tabbed editor
                contentManager.resizeTabbedEditor(stepName);
            }
        } else {
            // display error and provide link to fix it
            editor.createErrorLinkForCallBack(true, __correctEditorError);
        }
    };

    var __checkEditorContent = function(stepName, content) {
        var contentIsCorrect = true;
        if (stepName === "AsyncWithoutBulkhead") {
            contentIsCorrect = __validateEditorContentInJavaConcurrencyStep(content);
        } else if (stepName === "BulkheadAnnotation") {
            contentIsCorrect = __validateEditorContent_BulkheadStep(content);
        } else if (stepName === "AsyncBulkheadAnnotation") {
            contentIsCorrect = __validateEditorContent_AsyncBulkheadStep(content);
        } else if (stepName === "Fallback") {
            contentIsCorrect = __validateEditorContent_FallbackStep(content);
        }
        return contentIsCorrect;
    };

    var __correctEditorError = function(stepName) {
        if (stepName === "AsyncWithoutBulkhead") {
            __addJavaConcurrencyInEditor(stepName);
        } else if (stepName === "BulkheadAnnotation") {
            __addBulkheadInEditor(stepName);
        } else if (stepName === "AsyncBulkheadAnnotation") {
            var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
            var hasRequestForVFAMethod = __checkRequestForVFAMethod(content);
            __addAsyncBulkheadInEditor(stepName);
            if (hasRequestForVFAMethod === false) {
                __updateAsyncBulkheadMethodInEditor(stepName, false);
            }
        } else if (stepName === "Fallback") {
            __addFallbackAsyncBulkheadInEditor(stepName);
        } else if (stepName === "AddLibertyMPFaultTolerance") {
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
            "    ExecutorService executor = Executors.newSingleThreadExecutor();\n" +
            "    Future serviceRequest = executor.submit(() -> {\n" + 
            "      try {\n" +
            "        return serviceForVFA(counterForVFA);\n" +
            "      } catch (Exception ex) {\n" + 
            "        handleException();\n" +
            "      }\n" +
            "      return null;\n" +
            "    });";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 12, 12, newContent, 9);
    };

    var __validateEditorContentInJavaConcurrencyStep = function(content) {
        var match = false;
        try {
            var codesToMatch = "([\\s\\S]*)counterForVFA\\+\\+;\\s*" +
                "ExecutorService\\s+executor\\s*=\\s*Executors\\.newSingleThreadExecutor\\s*\\(\\s*\\)\\s*;\\s*" +
                "Future\\s+serviceRequest\\s*=\\s*executor\\.submit\\s*\\(\\s*\\(\\s*\\)\\s*->\\s*{\\s*" +
                "try\\s*{\\s*" +
                "return\\s+serviceForVFA\\s*\\(\\s*counterForVFA\\s*\\)\\s*;\\s*" +
                "}\\s*catch\\s*\\(\\s*Exception\\s+ex\\s*\\)\\s*{\\s*" +
                "handleException\\s*\\(\\s*\\)\\s*;\\s*" +
                "}\\s*" +
                "return\\s+null\\s*;\\s*" +
                "}\\s*\\)\\s*;\\s*}";
            var regExpToMatch = new RegExp(codesToMatch, "g");
            content.match(regExpToMatch)[0];
            match = true;
        } catch (ex) {
            // do nothing as match is already set to false
        }
        return match;
    };

    var __validateEditorContent_BulkheadStep = function(content) {
        var match = false;
        try {
            var pattern = "return null;\\s*}\\s*\\)\\s*;\\s*}\\s*" +
            "@Bulkhead\\(50\\)\\s*public\\s*Service\\s*serviceForVFA";
            var regExpToMatch = new RegExp(pattern, "g");
            content.match(regExpToMatch)[0];
            match = true;
        } catch (ex) {

        }
        return match;
    };

    var __checkRequestForVFAMethod = function(content) {
        var match = false;
        try {
            var pattern = "counterForVFA\\s*=\\s*0;\\s*" +
                    "public\\s*Future<Service>\\s*requestForVFA\\(\\)\\s*{\\s*" +
                    "counterForVFA\\+\\+;\\s*" +
                    "return\\s*serviceForVFA\\s*\\(\\s*counterForVFA\\s*\\);\\s*" +
                    "}\\s*@";
            var regExp = new RegExp(pattern, "g");
            content.match(regExp)[0];
            match = true;
        } catch (ex) {

        }
        return match;
    };

    var __checkServiceForVFAMethod = function(content) {
        var match = false;
        try {
            var pattern = ";\\s*}\\s*" +
                "@Asynchronous\\s*@Bulkhead\\s*\\(\\s*value\\s*=\\s*50\\s*,\\s*" + 
                "waitingTaskQueue\\s*=\\s*50\\s*\\)\\s*" +
                "public\\s*Future<Service>\\s*serviceForVFA\\s*\\(\\s*int counterForVFA\\s*\\)\\s*{\\s*" +
                "Service\\s*chatService\\s*=\\s*new\\s*ChatSession\\s*\\(\\s*counterForVFA\\s*\\);\\s*" + 
                "return\\s*CompletableFuture\\.completedFuture\\s*\\(\\s*chatService\\s*\\);\\s*" +
                "}\\s*}";
            var regExp = new RegExp(pattern, "g");
            content.match(regExp)[0];
            match = true;
        } catch (ex) {

        }
        return match;
    };

    var __validateEditorContent_AsyncBulkheadStep = function(content) {       
        var match = __checkServiceForVFAMethod(content) && __checkRequestForVFAMethod(content);
        return match;
    };

    var __validateEditorContent_FallbackStep = function(content) {
        var match = false;
        try {
            var pattern = "return\\s*serviceForVFA\\s*\\(\\s*counterForVFA\\s*\\);\\s*" +
            "}\\s*" + 
            "@Fallback\\s*\\(\\s*ServiceFallbackHandler\\.class\\s*\\)\\s*" +
            "@Asynchronous";
            var regExp = new RegExp(pattern, "g");
            content.match(regExp)[0];
            match = true;
        } catch (ex) {

        }
        return match;
    };

    var listenToEditorForBulkheadAnnotation = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    };

    var __addBulkheadInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "  @Bulkhead(50)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 22, 22, newContent, 1);
    };

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

    var clickChat = function(event, stepName, requestNum) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            handleNewChatRequestInBrowser(stepName, requestNum);
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
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var hasRequestForVFAMethod = __checkRequestForVFAMethod(content);

        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
   
        var params = [];
        var constructAnnotation = function(params) {
            var bulkheadAnnotation = "  @Asynchronous\n" +
                                     "  @Bulkhead(";
            if ($.isArray(params) && params.length > 0) {
                bulkheadAnnotation += params.join(",\n            ");
            }
            bulkheadAnnotation += ")\n" +
                                    "  public Future<Service> serviceForVFA(int counterForVFA) {\n" +
                                    "    Service chatService = new ChatSession(counterForVFA);\n" +
                                    "    return CompletableFuture.completedFuture(chatService);\n" +
                                    "  }";
            return bulkheadAnnotation;
        };

        params[0] = "value=50";
        params[1] = "waitingTaskQueue=50";

        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 24, 29, constructAnnotation(params), 7);
        if (hasRequestForVFAMethod === true) {
            __updateAsyncBulkheadMethodInEditor(stepName, false);
        }
    };

    var listenToEditorForAsyncBulkhead = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
        // Adjust the initial height of the editor to display the entire content
        __adjustEditorHeight(editor.getStepName(), "510px");
    };

    var addFallbackAsyncBulkheadButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addFallbackAsyncBulkheadInEditor(stepName);
        }
    };

    var __addFallbackAsyncBulkheadInEditor = function(stepName) {
        // Since the tabbed editor has 2 files for the fallback step, make sure the corrrect tab is in focus before
        // adding the new content.
        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var newContent =
            "  @Fallback(ServiceFallbackHandler.class)"; + 
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 16, 16, newContent, 1);
    };

    var listenToEditorForAsyncBulkheadFallback = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    };

    var updateAsyncBulkheadMethodButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __updateAsyncBulkheadMethodInEditor(stepName);
        }
    };

    var __updateAsyncBulkheadMethodInEditor = function(stepName, performReset) {
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var hasServiceForVFAMethod = __checkServiceForVFAMethod(content);

        var newContent = "  public Future<Service> requestForVFA() {\n" +
                         "    counterForVFA++;\n" + 
                         "    return serviceForVFA(counterForVFA);\n" +
                         "  }";

        if (performReset === undefined || performReset === true) {
            contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        }
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 11, 22, newContent, 10);
        // Adjust the height of the editor back to the original height
        __adjustEditorHeight(stepName, "468px");

        if (hasServiceForVFAMethod === true && (performReset === undefined || performReset === true)) {
            __addAsyncBulkheadInEditor(stepName);
        }
    };

    var __adjustEditorHeight = function(stepName, heightToUse) {
        var containers = $(".subContainerDiv[data-step='" + stepName + "']");
        $.each( containers, function(index, container) {
            var editorContainer = $(container).find(".editorContainer");
            if (editorContainer.length === 1) {
                editorContainer.css("height", heightToUse);
                return false; // break out of the loop
            }
        });
    };

    var __browserVirtualAdvisorBaseURL = "https://global-ebank.openliberty.io/virtualFinancialAdvisor/";
    var __advisors = ["Bob", "Jenny", "Lee", "Mary", "John", "Mike", "Sam", "Sandy", "Joann", "Frank" ];
    var __advisorColors = ['royalblue', 'gray', 'seagreen'];
    var __advisorInitials = ["B", "J", "L"];
    var handleNewChatRequestInBrowser = function(stepName, requestNum) {
        var browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-chat.html";  
        var browserUrl = __browserVirtualAdvisorBaseURL + "Advisor" + requestNum;
        var browserErrorUrl = __browserVirtualAdvisorBaseURL + "error";
        var requestLimits = 1;
        var browser = contentManager.getBrowser(stepName);
        var refreshBrowserContent = true;

        contentManager.markCurrentInstructionComplete(stepName);
        contentManager.updateWithNewInstructionNoMarkComplete(stepName);
        if (stepName === "AsyncWithoutBulkhead") {
            requestLimits = 3;
            if (requestNum === 2) {
                // we don't want to refresh the browser content as we could simply replace the financial advisor
                // initial and name with the existing content. By not refreshing the browser content, we eliminate
                // the timing problem of setting the advisor initial and name before the content is refreshed.
                refreshBrowserContent = false;
            }
            if (requestNum >= requestLimits) {
                browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-error-503.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "FinancialAdvisor") {
            requestLimits = 2;
            if (requestNum >= requestLimits) {        
                browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-no-available.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "BulkheadAnnotation") {
            requestLimits = 2;
            if (requestNum === 1) {
                $("#" + stepElementId).find(".busyCount").text('1');
                $("#" + stepElementId).find(".busyChatCount").attr("aria-label", "1 chat is currently in progress");
            } else if (requestNum === requestLimits) {
                browser.setBrowserContent("/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-processing.html");
                __incrementCounts(stepName, 2, 51, ".busyCount", browserErrorUrl,
                                 "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-bulkhead-error.html");
                return;
            } else if (requestNum > requestLimits) {
                browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-bulkhead-error.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "AsyncBulkheadAnnotation") {
            requestLimits = 2;
            if (requestNum === 1) {
                $("#" + stepElementId).find(".busyCount").text('1');
                $("#" + stepElementId).find(".busyChatCount").attr("aria-label", "1 chat is currently in progress");
            } else if (requestNum === 2) {
                browser.setBrowserContent("/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-processing.html");
                __incrementCounts(stepName, 2, 51, ".busyCount", __browserVirtualAdvisorBaseURL + "waitingqueue",
                                 "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-waitingqueue.html", true);
                return;
            } else if (requestNum === 3) {
                browser.getIframeDOM().find(".errorTextBox").hide();
                __incrementCounts(stepName, 2, 51, ".waitCount", browserErrorUrl,
                                 "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-bulkhead-error.html");
                return;
            } else if (requestNum > 3) {
                browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-bulkhead-error.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "Fallback") {
            requestLimits = 2;
            if (requestNum === 1) {
                $("#" + stepElementId).find(".busyCount").text('1');
                $("#" + stepElementId).find(".busyChatCount").attr("aria-label", "1 chat is currently in progress");
            } else if (requestNum === 2) {
                browser.setBrowserContent("/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-processing.html");
                __incrementCounts(stepName, 2, 51, ".busyCount", __browserVirtualAdvisorBaseURL + "waitingqueue", 
                                 "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-waitingqueue.html", true);
                return;
            } else if (requestNum === 3) {
                browser.getIframeDOM().find(".errorTextBox").hide();
                __incrementCounts(stepName, 2, 51, ".waitCount", __browserVirtualAdvisorBaseURL + "scheduleAppointment",
                                 "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-fallback.html");
                return;
            } else if (requestNum > 3) {
                browserContentHTML = "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-fallback.html";
                browserUrl = __browserVirtualAdvisorBaseURL + "scheduleAppointment";
            }
        }

        contentManager.setBrowserURL(stepName, browserUrl, 0);
        if (refreshBrowserContent) {
            browser.setBrowserContent(browserContentHTML);
        }
        if (requestNum < requestLimits) {
            // use a interval timer to make sure the browser content is rendered before accessing the elements
            var waitingForBrowserContentTimeInterval = setInterval(function () {
                if (browser.getIframeDOM().find(".advisorName").length === 1) {
                    clearInterval(waitingForBrowserContentTimeInterval);
                    var advisor = __advisors[requestNum - 1];
                    var advisorBackgroundColor = __advisorColors[requestNum - 1];
                    var chatAdvisorCount  = "You are talking to advisor " + requestNum + ".";
                    var chatIntro = "Hi, I am " + advisor + ",";
                    browser.getIframeDOM().find(".chatAdvisorCount").text(chatAdvisorCount);
                    browser.getIframeDOM().find(".advisorName").text(chatIntro);
                    browser.getIframeDOM().find(".advisorInitial").text(__advisorInitials[requestNum-1]);
                }
            }, 10);
        }
    };

    var __incrementCounts = function(stepName, startingCount, endingCount, elementToBeCounted, urlForAfterCount, htmlForAfterCount, startingWaitingQueue) {
        var timeInterval = setInterval(function () {
            $("#" + stepElementId).find(elementToBeCounted).text(startingCount);
            startingCount++;
            if (startingCount === endingCount) {
                clearInterval(timeInterval);
                contentManager.setBrowserURL(stepName, urlForAfterCount, 0);
                browser.setBrowserContent(htmlForAfterCount);
                if (startingWaitingQueue) {
                    $("#" + stepElementId).find(".waitCount").text(1);
                    $("#" + stepElementId).find(".waitChatCount").attr("aria-label", "1 chat request is waiting in the queue");
                    $("#" + stepElementId).find(".busyChatCount").attr("aria-label", "50 chats are currently in progress");
                } else {
                    if (elementToBeCounted === ".busyCount") {
                        $("#" + stepElementId).find(".busyChatCount").attr("aria-label", "50 chats are currently in progress");
                    } else {
                        $("#" + stepElementId).find(".waitChatCount").attr("aria-label", "50 chat requests are waiting in the queue");
                    }
                }
            }
        }, 20);
    };

    var __listenToPlaygroundEditorAnnotationChanges = function(editor){
        var __listenToContentChanges = function(editorInstance, changes) {
            // Get pod from contentManager
            var bulkhead = contentManager.getPlayground(editor.getStepName());
            // Get the parameters from the editor and send to the bulkhead
            var content = editor.getEditorContent();
            try{
                var matchPattern = "@Asynchronous\\s*@Bulkhead\\s*\\((([^\\(\\)])*?)\\)\\s*public Future<Service> serviceForVFA";
                var regexToMatch = new RegExp(matchPattern, "g");
                var groups = regexToMatch.exec(content);
                var annotation = groups[1];

                var params = annotation.replace(/[{\s()}]/g, ''); // Remove whitespace and parenthesis
                params = params.split(',');

                var value;
                var waitingTaskQueue;

                // Parse their annotation for values
                params.forEach(function(param, index){
                    if (param.indexOf('value=') > -1){
                        value = param.substring(param.indexOf('value=') + 6);
                    }
                    if (param.indexOf('waitingTaskQueue=') > -1){
                        waitingTaskQueue = param.substring(param.indexOf('waitingTaskQueue=') + 17);
                    }
                });
                
                var errorPosted = false;
                if ((value !== undefined && !utils.isInteger(value)) || 
                    (waitingTaskQueue !== undefined && !utils.isInteger(waitingTaskQueue))) {
                    editor.createCustomErrorMessage(bulkheadMessages.parmsPositive);
                    errorPosted = true;
                } else {
                    value = parseInt(value);
                    waitingTaskQueue = parseInt(waitingTaskQueue);
                    if (value > 10) {
                        editor.createCustomErrorMessage(utils.formatString(bulkheadMessages.parmsMaxValue,["value"]));
                        errorPosted = true;
                    } else if (waitingTaskQueue > 10) {
                        editor.createCustomErrorMessage(utils.formatString(bulkheadMessages.parmsMaxValue,["waitingTaskQueue"]));
                        errorPosted = true;
                    } else if (waitingTaskQueue < value) {
                        editor.createCustomAlertMessage(bulkheadMessages.waitBestPractice);
                        // Do not return here.  Post warning and allow user to continue with their simulation.
                    } else {
                        // Clear out any previous error boxes displayed.
                        editor.closeEditorErrorBox();
                    }
                }

                if (!errorPosted) {
                    // Apply the annotation values to the bulkhead.
                    // If not specified, the bulkhead will use its default value.
                    bulkhead.updateParameters.apply(bulkhead, [value, waitingTaskQueue]);
                    // Enable the playground buttons.
                    bulkhead.enableActions(true);
                } else {
                    // Error message was posted which must be fixed.  Don't allow processing
                    // of the playground until it is resolved.
                    bulkhead.enableActions(false);
                }
            }
            catch(e){

            }
        };
        editor.addSaveListener(__listenToContentChanges);
    };

    var __createAsyncBulkhead = function(root, stepName) {
        // If root is not a jQuery element, get the jQuery element from the root object passed in
        if(!root.selector){
            root = root.contentRootElement;
        }

        var ab = asyncBulkhead.create(root, stepName, 5, 5);
        root.asyncBulkhead = ab;

        root.find(".bulkheadThreadRequestButton").on("click", function() {
            ab.sendStartChatRequest();
        });
        root.find(".bulkheadThreadReleaseButton").on("click", function() {
            ab.sendEndChatRequest();
        });
        root.find(".bulkheadResetButton").on("click", function() {
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
        addFallbackAsyncBulkheadButton: addFallbackAsyncBulkheadButton,
        listenToEditorForAsyncBulkheadFallback: listenToEditorForAsyncBulkheadFallback,
        handleNewChatRequestInBrowser: handleNewChatRequestInBrowser,
        addAsyncBulkheadButton: addAsyncBulkheadButton,
        updateAsyncBulkheadMethodButton: updateAsyncBulkheadMethodButton,
        listenToPlaygroundEditorAnnotationChanges: __listenToPlaygroundEditorAnnotationChanges,
        createAsyncBulkhead: __createAsyncBulkhead
    };

})();
