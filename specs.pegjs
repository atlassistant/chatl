{ 
	var cur_step = 0;
    var level = 0;
    
    function flattenProps(obj) {
    	return (obj.props || []).reduce((prev, cur) => {
          	prev[cur.key] = cur.value;
          	return prev;
          }, {});
    }
}

start=data:(IntentDefinition/EntityDefinition/SynonymDefinition)+
{ 
	var r = {
    	intents: {},
        entities: {},
        synonyms: {},
    };
    
    for (var synonym of data.filter(o => o.type === 'synonym')) {
    	r.synonyms[synonym.name] = synonym.data.map(o => o.value);
    }
    
	for (var intent of data.filter(o => o.type === 'intent')) {
    	r.intents[intent.name] = { 
        	props: flattenProps(intent),
            data: intent.data,
        };
    }
    
    for (var entity of data.filter(o => o.type === 'entity')) {
    	r.entities[entity.name] = { 
          	props: flattenProps(entity),
          	data: entity.data.map(o => ({
              	value: o.value,
            	synonyms: o.type === 'synonym' ? r.synonyms[o.value] || [] : [],
          	})) };
    }
    
    return r;
}

Samedent "correct indentation" = s:" "* &{ return s.length === level; }
Indent = &(i:[ ]* &{ cur_step=i.length; level+=cur_step; return true; })
Dedent = &(i:[ ]* &{ level-=cur_step; return true; })

EntityName "entity name"  = "[" value:[a-zA-Z_/: ]+ "]" { return value.join('') }
AnyText "any text" = v:(t:((!"\r\n")(!"\n")(!"@[") .) { return t.join(""); })+ { return v.join(""); }

Sentence "sentence" = text:AnyText+ { return { type: 'text', value: text.join('') } }
Entity "entity alias" = "@" value:EntityName { return { type: 'entity', value: value } }
Synonym "synonym alias" = "~" value:EntityName { return { type: 'synonym', value: value } }

IntentData "intent data" = Samedent inner:(Entity/Sentence)+ EOL? { return inner }
IntentDefinition "intent definition"  = EOL? "%" name:EntityName props:Props? EOL?
 	Indent data:IntentData+ Dedent
 	{ return { type: 'intent', props, name: name, data } }

Prop "property" = key:[a-zA-Z_]* "=" value:[a-zA-Z_/]* [ ]* [,]? [ ]* { return { key: key.join(''), value: value.join('') } }
Props "properties" = "(" props:Prop+ ")" { return props }

EntityData "entity data" = Samedent inner:(Synonym/Sentence)+ EOL? { return inner }
EntityDefinition "entity definition" = EOL? "@" name:EntityName props:Props? EOL?
	Indent data:EntityData* Dedent
	{ return { type: 'entity', props, name: name, data: data.map(o => o[0]) } }

SynonymData "synonym data" = Samedent inner:Sentence+ EOL? { return inner }
SynonymDefinition "synonym definition" = EOL? "~" name:EntityName EOL?
	Indent data:SynonymData* Dedent
	{ return { type: 'synonym', name: name, data: data.map(o => o[0]) } }

EOL=("\n"/"\r\n")+
EOF = !.