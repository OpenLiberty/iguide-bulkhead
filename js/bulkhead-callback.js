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
        if (__checkEditorContent(stepName, content)) {
            //editor.closeEditorErrorBox(stepName);
            var index = contentManager.getCurrentInstructionIndex();
            if(index === 0){
                contentManager.markCurrentInstructionComplete(stepName);
                contentManager.updateWithNewInstructionNoMarkComplete(stepName);
                // display the pod with chat button and web browser in it
                contentManager.setPodContent(stepName,
                    "/guides/draft-iguide-bulkhead/html/virtual-financial-advisor-new-session.html");
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
            "      return serviceForVFA();\n" + 
            "    });\n";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 11, 11, newContent, 4);
    };

    var __addBulkheadInEditor = function(stepName, fileName) {
        contentManager.resetTabbedEditorContents(stepName, fileName);
        var content = contentManager.getTabbedEditorContents(stepName, fileName);
        var newContent = "    @Bulkhead(2)";
        contentManager.replaceTabbedEditorContents(stepName, fileName, 7, 7, newContent, 1);
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
            __addBulkheadInEditor(stepName, 'VirtualFinancialAdvisor.java');
        }
    };

    var clickChat = function(event, stepName) {
        if (stepName === "AsyncWithoutBulkhead") {
            $('#asyncWithoutBulkheadStep').find('.newSessionButton').trigger('click');
        }
    };

    return {
        listenToEditorForFeatureInServerXML: __listenToEditorForFeatureInServerXML,
        addMicroProfileFaultToleranceFeatureButton: addMicroProfileFaultToleranceFeatureButton,
        saveServerXMLButton: saveServerXMLButton,
        addJavaConcurrencyButton: addJavaConcurrencyButton,
        addBulkheadButton: addBulkheadButton,
        saveButtonEditorButton: saveButtonEditorButton,
        listenToEditorForJavaConcurrency: listenToEditorForJavaConcurrency,
        clickChat: clickChat
    };

})();
