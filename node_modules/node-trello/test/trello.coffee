request = require "request"
mocha = require "mocha"
should = require "should"
Trello = require "../index"

behavesLike = require "./trello-behaviors"

describe "Trello", () ->

  describe "#constructor()", () ->
    it "should throw an Error if no API key is supplied", () ->
      (() -> new Trello()).should.throw "Application API key is required"
    it "should not require a user's token", () ->
      new Trello("APIKEY").should.be.ok
    it "should set key and token properties", () ->
      trello = new Trello("APIKEY", "USERTOKEN")
      trello.key.should.equal "APIKEY"
      trello.token.should.equal "USERTOKEN"

  describe "Requests", () ->
    beforeEach () ->
      request.get = (options) =>
        @request = options: options
        return new process.EventEmitter()
      request.post = (options) =>
        @request = options: options
        return new process.EventEmitter()
      request.put = (options) =>
        @request = options: options
        return new process.EventEmitter()
      request.del = (options) =>
        @request = options: options
        return new process.EventEmitter()
      request.verb = (options) =>
        @request = options: options
        return new process.EventEmitter()

      @trello = new Trello("APIKEY", "USERTOKEN")

    describe "#get()", () ->
      beforeEach () -> @trello.get "/test", { type: "any" }, () ->
      behavesLike.aRequest()

      it "should not require json arguments", () ->
        @trello.get "/test", () ->
        @request.options.json.should.be.ok

      it "should make a GET request", () ->
        @request.options.method.should.equal "GET"

    describe "#post()", () ->
      beforeEach () -> @trello.post "/test", { type: "any" }, () ->
      behavesLike.aRequest()

      it "should not require json arguments", () ->
        @trello.post "/test", () ->
        @request.options.json.should.be.ok

      it "should make a POST request", () ->
        @request.options.method.should.equal "POST"

      it "should not have query parameters", () ->
        @request.options.url.should.not.include "?"

    describe "#put()", () ->
      beforeEach () -> @trello.put "/test", { type: "any" }, () ->
      behavesLike.aRequest()

      it "should not require json arguments", () ->
        @trello.post "/test", () ->
        @request.options.json.should.be.ok

      it "should make a PUT request", () ->
        @request.options.method.should.equal "PUT"

    describe "#del()", () ->
      beforeEach () -> @trello.del "/test", { type: "any" }, () ->
      behavesLike.aRequest()

      it "should not require json arguments", () ->
        @trello.del "/test", () ->
        @request.options.json.should.be.ok

      it "should make a DELETE request", () ->
        @request.options.method.should.equal "DELETE"

    describe "#request()", () ->
      beforeEach () -> @trello.request "VERB", "/test", { type: "any" }, () ->
      behavesLike.aRequest()

      it "should not require json arguments", () ->
        @trello.request "VERB", "/test", () ->
        @request.options.json.should.be.ok

      it "should make a request with any method specified", () ->
        @request.options.method.should.equal "VERB"

      it "should allow uris with a leading slash", () ->
        @trello.request "VERB", "/test", () ->
        @request.options.url.should.include "https://api.trello.com/test"

      it "should allow uris without a leading slash", () ->
        @trello.request "VERB", "test", () ->
        @request.options.url.should.include "https://api.trello.com/test"

      it "should parse jsonstring parameters from the uri", () ->
        @trello.request "VERB", "/test?name=values", () ->
        @request.options.json.should.have.property "name"
        @request.options.json.name.should.equal "values"

      it "should pass through any errors without response bodies", () ->
        method = request.get
        request.get = (options, callback) ->
          callback(new Error("Something bad happened."))

        @trello.request "GET", "/test", (err, response) ->
          err.message.should.equal "Something bad happened."

        request.get = method
