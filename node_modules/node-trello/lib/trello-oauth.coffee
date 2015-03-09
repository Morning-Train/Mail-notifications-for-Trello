OAuth = (require "oauth").OAuth

requestUrl = "https://trello.com/1/OAuthGetRequestToken"
accessUrl = "https://trello.com/1/OAuthGetAccessToken"
authorizeUrl = "https://trello.com/1/OAuthAuthorizeToken"

class TrelloOAuth
   # key: your trello application's API key
   # secret: your trello application's API secret
   # loginCallback: the URL that trello redirects back to after authentication
   # appName: the name you'd like shown on trello's "authorize this app" page
   constructor: (key, secret, loginCallback, appName) ->
      @oauth = new OAuth(requestUrl, accessUrl, key, secret, 
         "1.0", loginCallback, "PLAINTEXT")
      @appName = appName

   getRequestToken: (callback) ->
      @oauth.getOAuthRequestToken (error, token, tokenSecret, results) =>
         if error then callback error, null
         else callback null, 
            oauth_token: token,
            oauth_token_secret: tokenSecret,
            redirect: authorizeUrl + "?oauth_token=#{token}&name=#{@appName}"

   # bag: the data bag returned from #getRequestToken() merged with the query
   #      variables given from the user redirect back to the loginCallback.
   getAccessToken: (bag, callback) ->
      token = bag.oauth_token
      tokenSecret = bag.oauth_token_secret
      verifier = bag.oauth_verifier

      @oauth.getOAuthAccessToken token, tokenSecret, verifier, 
         (error, accessToken, accessTokenSecret, results) ->
            if error then callback error, null
            else callback null,
               oauth_token: token,
               oauth_token_secret: tokenSecret, 
               oauth_access_token: accessToken,
               oauth_access_token_secret: accessTokenSecret

module.exports = TrelloOAuth