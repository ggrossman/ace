/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {
  "use strict";

  var oop = require("../lib/oop");
  var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
  var XmlHighlightRules = require("./xml_highlight_rules").XmlHighlightRules;

  var ZendeskXmlHighlightRules = function() {
    XmlHighlightRules.call(this);

    var ticketPlaceholders = (
      "ticket.account|ticket.cc_names|ticket.created_at|ticket.created_at_with_timestamp|ticket.description|" +
      "ticket.due_date|ticket.due_date_with_timestamp|ticket.external_id|ticket.group.name|ticket.id|" +
      "ticket.in_business_hours|ticket.link|ticket.priority|ticket.score|ticket.status|ticket.tags|" +
      "ticket.ticket_field_|ticket.ticket_field_option_title_|ticket.ticket_type|ticket.title|ticket.updated_at|" +
      "ticket.updated_at_with_timestamp|ticket.url|ticket.url_with_protocol|ticket.via|ticket.public_comments|" +
      "ticket.latest_comment|ticket.latest_public_comment|ticket.comments_formatted|ticket.public_comments_formatted|" +
      "ticket.latest_comment_formatted|ticket.latest_public_comment_formatted|ticket.assignee|ticket.submitter"
      );

    var commentPlaceholders = (
      "ticket.latest_comment.author|ticket.latest_comment.created_at|ticket.latest_comment.created_at_with_time|" +
      "ticket.latest_comment.is_public|ticket.latest_comment.value|ticket.latest_comment.attachments|" +

      "ticket.latest_public_comment.author|ticket.latest_public_comment.created_at|ticket.latest_public_comment.created_at_with_time|" +
      "ticket.latest_public_comment.is_public|ticket.latest_public_comment.value|ticket.latest_public_comment.attachments"
      );

    var userPlaceholders = (
      "current_user|current_user.name|current_user.first_name|current_user.last_name|current_user.email|" +
      "current_user.language|current_user.phone|current_user.external_id|current_user.details|current_user.notes|" +
      "current_user.time_zone|current_user.role|current_user.extended_role|current_user.id|current_user.locale|" +
      "current_user.signature|current_user.organization|current_user.tags|current_user.custom_fields.|" +

      "ticket.submitter.name|ticket.submitter.first_name|ticket.submitter.last_name|ticket.submitter.email|" +
      "ticket.submitter.language|ticket.submitter.phone|ticket.submitter.external_id|ticket.submitter.details|" +
      "ticket.submitter.notes|ticket.submitter.time_zone|ticket.submitter.role|ticket.submitter.extended_role|" +
      "ticket.submitter.id|ticket.submitter.locale|ticket.submitter.signature|ticket.submitter.organization|" +
      "ticket.submitter.tags|ticket.submitter.custom_fields.|" +

      "ticket.assignee.name|ticket.assignee.first_name|ticket.assignee.last_name|ticket.assignee.email|" +
      "ticket.assignee.language|ticket.assignee.phone|ticket.assignee.external_id|ticket.assignee.details|ticket.assignee.notes|" +
      "ticket.assignee.time_zone|ticket.assignee.role|ticket.assignee.extended_role|ticket.assignee.id|ticket.assignee.locale|" +
      "ticket.assignee.signature|ticket.assignee.organization|ticket.assignee.tags|ticket.assignee.custom_fields."
      );

    var organizationPlaceholders = (
      "current_user.organization.id|current_user.organization.name|current_user.organization.is_shared|" +
      "current_user.organization.is_shared_comments|current_user.organization.details|current_user.organization.notes|" +
      "current_user.organization.tags|" +

      "ticket.submitter.organization.id|ticket.submitter.organization.name|ticket.submitter.organization.is_shared|" +
      "ticket.submitter.organization.is_shared_comments|ticket.submitter.organization.details|" +
      "ticket.submitter.organization.notes|ticket.submitter.organization.tags|" +

      "ticket.assignee.organization.id|ticket.assignee.organization.name|ticket.assignee.organization.is_shared|" +
      "ticket.assignee.organization.is_shared_comments|ticket.assignee.organization.details|" +
      "ticket.assignee.organization.notes|ticket.assignee.organization.tags|" +

      "ticket.organization.id|ticket.organization.name|ticket.organization.is_shared|" +
      "ticket.organization.is_shared_comments|ticket.organization.details|ticket.organization.notes|ticket.organization.tags"
      );

    var satisfactionPlaceholders = (
      "satisfaction|satisfaction.rating_section|satisfaction.current_rating|satisfaction.positive_rating_url|" +
      "satisfaction.negative_rating_url|satisfaction.current_comment"
      );

    var keywordMapper = this.createKeywordMapper({
      "ticket": ticketPlaceholders,
      "comment": commentPlaceholders,
      "user": userPlaceholders,
      "organization": organizationPlaceholders,
      "satisfaction": satisfactionPlaceholders
    }, "identifier");

    // add liquid start tags to the HTML start tags
    for (var rule in this.$rules) {
      this.$rules[rule].unshift({
        token : "variable",
        regex : "{%",
        push : "liquid-start"
      }, {
        token : "variable",
        regex : "{{",
        push : "liquid-start"
      });
    }

    this.addRules({
      "liquid-start" : [{
        token: "variable",
        regex: "}}",
        next: "pop"
      }, {
        token: "variable",
        regex: "%}",
        next: "pop"
      }, {
        token : "string", // single line
        regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
      }, {
        token : "string", // single line
        regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
      }, {
        token : "constant.numeric", // hex
        regex : "0[xX][0-9a-fA-F]+\\b"
      }, {
        token : "constant.numeric", // float
        regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
      }, {
        token : "constant.language.boolean",
        regex : "(?:true|false)\\b"
      }, {
        token : keywordMapper,
        regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
      }, {
        token : "keyword.operator",
        regex : "\/|\\*|\\-|\\+|=|!=|\\?\\:"
      }, {
        token : "paren.lparen",
        regex : /[\[\({]/
      }, {
        token : "paren.rparen",
        regex : /[\])}]/
      }, {
        token : "text",
        regex : "\\s+"
      }]
    });

    this.normalizeRules();
  };
  oop.inherits(ZendeskXmlHighlightRules, TextHighlightRules);

  exports.ZendeskXmlHighlightRules = ZendeskXmlHighlightRules;
});
