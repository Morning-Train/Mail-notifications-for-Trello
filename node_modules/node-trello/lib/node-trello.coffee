request = require "request"
querystring = require "querystring"
OAuth = require "./trello-oauth"

class Trello
  # Creates a new Trello request wrapper.
  # Syntax: new Trello(applicationApiKey, userToken)
  constructor: (key, token) ->
    throw new Error "Application API key is required" unless key?
    @key = key
    @token = token
    @host = "https://api.trello.com"

  # Make a GET request to Trello.
  # Syntax: trello.get(uri, [query], callback)
  get: () ->
    Array.prototype.unshift.call arguments, "GET"
    @request.apply this, arguments

  # Make a POST request to Trello.
  # Syntax: trello.post(uri, [query], callback)
  post: () ->
    Array.prototype.unshift.call arguments, "POST"
    @request.apply this, arguments

  # Make a PUT request to Trello.
  # Syntax: trello.put(uri, [query], callback)
  put: () ->
    Array.prototype.unshift.call arguments, "PUT"
    @request.apply this, arguments

  # Make a DELETE request to Trello.
  # Syntax: trello.del(uri, [query], callback)
  del: () ->
    Array.prototype.unshift.call arguments, "DELETE"
    @request.apply this, arguments

  # Make a request to Trello.
  # Syntax: trello.request(method, uri, [query], callback)
  request: (method, uri, argsOrCallback, callback) ->
    if arguments.length is 3 then callback = argsOrCallback; args = {}
    else args = argsOrCallback || {}

    url = @host + (if uri[0] is "/" then "" else "/") + uri
    if method is "GET" then url += '?' + querystring.stringify @addAuthArgs @parseQuery uri, args;

    options =
      url: url
      method: method
      json: @addAuthArgs @parseQuery uri, args

    request[if method is 'DELETE' then 'del' else method.toLowerCase()] options, (err, response, body) =>
      if !err && response.statusCode >= 400
        err = new Error(body)
        err.statusCode = response.statusCode
        err.responseBody = body
        err.statusMessage = require('http').STATUS_CODES[response.statusCode]
      callback err, body

  addAuthArgs: (args) ->
    args.key = @key
    args.token = @token if @token
    return args

  parseQuery: (uri, args) ->
    if uri.indexOf("?") isnt -1
      for key, value of querystring.parse uri.split("?")[1]
        args[key] = value

    return args

Trello.OAuth = OAuth
module.exports = Trello
