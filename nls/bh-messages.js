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
var bulkheadMessages = (function() {
    var __returnMessages = function() {
        
        return { 
            AVAILABLE_CHAT: messages.AVAILABLE_CHAT,
            AVAILABLE_SLOT: messages.AVAILABLE_SLOT,
            TAKEN_SLOT: messages.TAKEN_SLOT,
            REQUESTED_CHATS: messages.REQUESTED_CHATS,
            SIZE_OF_TP: messages.SIZE_OF_TP,
            NUMBER_WAITING: messages.NUMBER_WAITING,
            SIZE_OF_WAITING: messages.SIZE_OF_WAITING,
            ONE_CHAT_WAITING: messages.ONE_CHAT_WAITING,
            FIFTY_CHATS_INPROGRESS: messages.FIFTY_CHATS_INPROGRESS,
            FIFTY_CHATS_WAITING: messages.FIFTY_CHATS_WAITING,
            PARMS_MAX_VALUE: messages.PARMS_MAX_VALUE,
            PARMS_GT_ZERO: messages.PARMS_GT_ZERO,
            WAIT_BEST_PRACTICE: messages.WAIT_BEST_PRACTICE 
        };
    };
  
    return {
      returnMessages: __returnMessages
    };
  })();