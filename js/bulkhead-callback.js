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

    var __saveButtonEditor = function(stepName) {
        contentManager.saveEditor(stepName);
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
        var content = contentManager.getEditorContents(stepName);
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
        if (stepName === "UsingJavaConcurrency") {
            // to be implemented
        }
        return contentIsCorrect;
    };

    var __correctEditorError = function(stepName) {
        if (stepName === "UsingJavaConcurrency") {
            __addJavaConcurrencyInEditor(stepName);
        }
    };

    var listenToEditorForJavaConcurrency = function(editor) {       
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    };

    var __addJavaConcurrencyInEditor = function(stepName) {
        // reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.resetEditorContents(stepName);
        var content = contentManager.getEditorContents(stepName);
        var newContent = 
            "        ExecutorService executor = Executors.newFixedThreadPool(1);\n" +
            "        Future serviceRequest = executor.submit(() -> {\n" + 
            "            return virtualFinancialAdvisorService();\n" + 
            "        });\n";
        contentManager.replaceEditorContents(stepName, 10, 10, newContent, 4);
    };

    var addJavaConcurrencyButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addJavaConcurrencyInEditor(stepName);
        }
    };

    var clickChat = function(event, stepName) {
        if (stepName === "UsingJavaConcurrency") {
            $('#usingJavaConcurrencyStep').find('.newSessionButton').trigger('click');
        }
    };


    return {
        addJavaConcurrencyButton: addJavaConcurrencyButton,
        saveButtonEditorButton: saveButtonEditorButton,
        listenToEditorForJavaConcurrency: listenToEditorForJavaConcurrency,
        clickChat: clickChat
    };

})();
