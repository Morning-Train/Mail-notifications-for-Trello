should = require "should"

module.exports =
  aRequest: () ->
    it "should include the key in the json", () ->
      @request.options.json.should.have.property "key"
      @request.options.json.key.should.equal "APIKEY"

    it "should include the token in the json", () ->
      @request.options.json.should.have.property "token"
      @request.options.json.token.should.equal "USERTOKEN"

    it "should pass any json arguments from the 'json' object", () ->
      @request.options.json.should.have.property "type"
      @request.options.json.type.should.equal "any"

    it "should try to contact https://api.trello.com/test", () ->
      @request.options.url.should.include "https://api.trello.com/test"
