/* description: Parses Biblionarrator queries. */

/* lexical grammar */
%lex
%%

\s+                         /* skip whitespace */
"("                         return 'GS';
")"                         return 'GE'; // Group End
(keyword|author|title)\[    return 'FACET_START';
\]                          return 'FACET_END';
(keyword|author|title)\:    return 'INDEX'
"!"                         return 'NOT'; // Not
"||"                        return 'OR'; // Or
"&&"                        return 'AND'; // And
["][^"]*["]                 return 'PHR'; // Phrase
[^\s()!:|&]+                return 'WORD'
<<EOF>>                     return 'EOF';


/lex

/* operator associations and precedence */
%right OR AND
%left NOT

%start plan

%% /* language grammar */

plan
    : query EOF
        {  /*typeof console !== 'undefined' ? console.log($1) : print($1);*/
            return $1; }
    ;       

query
    : query AND query
        { $$ = [ 'AND', $1, $3 ]; }
    | query OR query
        { $$ = [ 'OR', $1, $3 ]; }
    | NOT query
        { $$ = [ 'NOT', $2 ]; }
    | query query
        { $$ = [ 'AND', $1, $2 ]; }
    | node
        { $$ = $1; }
    | explicit_group_start query explicit_group_end
        { $$ = $2; }
    ;

explicit_group_start
    : GS
        { if (!yy.indexStack) yy.indexStack = [ /*yy.curindex ||*/ 'keyword' ]; }
        // These contortions make it possible to maintain a default index stack,
        // but as it turns out, following the close of an explicit group the user
        // is more likely to expect a return to the 'keyword' index than a return
        // to the last-set index prior to the explicit group. I am leaving the
        // code because it took me ages to figure it out, and I don't want to lose
        // it. Perhaps at some point we will actually find a use for a stack like
        // this.
    ;

explicit_group_end
    : GE
        { yy.curindex = yy.indexStack.shift(); }
    ;

node
    : term
    | facet
    ;

term
    : INDEX object
        { yy.curindex = $1.slice(0,$1.length - 1); $$ = [ 'HAS', yy.curindex, $2 ]; }
    | object
        { if (typeof yy.curindex === 'undefined') yy.curindex = 'keyword'; $$ = [ 'HAS', yy.curindex, $1 ]; }
    ;

facet
    : FACET_START atomset FACET_END
        { $$ = [ 'FACET', $1.slice(0,$1.length - 1), $2 ] }
    ;

phrase
    : PHR
        { $$ = [ 'PHRASE', $1.substring(1, $1.length - 1) ]; }
    ;

object
    : atomset
    | phrase
    ;

atomset
    : atomset atom
        { $1.push($2); $$ = $1; }
    | atom
        { $$ = [ 'ATOM', $1 ]; }
    ;

atom
    : WORD
        { $$ = $1; }
    ;

