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

start=data:(IntentDefinition/EntityDefinition/SynonymDefinition/Comment)+
{ 
	var r = {
    	intents: {},
        entities: {},
        synonyms: {},
        comments: data.filter(o => o.type === 'comment'),
    };
    
    for (const synonym of data.filter(o => o.type === 'synonym')) {
    	r.synonyms[synonym.name] = synonym.data.map(o => o.value);
    }
    
	for (const intent of data.filter(o => o.type === 'intent')) {
    	r.intents[intent.name] = { 
        	props: flattenProps(intent),
            data: intent.data,
        };
    }
    
    for (const entity of data.filter(o => o.type === 'entity')) {
    	if (!r.entities[entity.name]) {
        	r.entities[entity.name] = { variants: {} };
        }
        
        r.entities[entity.name].props = {
        	...r.entities[entity.name].props,
        	...flattenProps(entity),
        };
        
        const data =  entity.data.map(o => ({
            value: o.value,
            synonyms: o.type === 'synonym' ? r.synonyms[o.value] || [] : [],
        }));
        
        if (entity.variant) {
        	r.entities[entity.name].variants[entity.variant] = data;
        } else {
        	r.entities[entity.name].data = data;
        }
    }
    
    return r;
}

Samedent "correct indentation" = s:" "* &{ return s.length === level; }
Indent = &(i:[ ]* &{ cur_step=i.length; level+=cur_step; return true; })
Dedent = &(i:[ ]* &{ level-=cur_step; return true; })

EntityName "entity name"  = "[" name:(t:((!"]")(!"#") .) { return t.join(''); })+ "#"? variant:(t:((!"]") .) { return t.join(''); })* "]" { return { name: name.join(''), variant: variant.join('') || null }; }
AnyText "any text" = v:(t:((!"\n")(!"\r\n")(!"@[") .) { return t.join(''); })+ { return v.join(''); }

Sentence "sentence" = text:AnyText+ { return { type: 'text', value: text.join('') } }
Entity "entity alias" = "@" entity:EntityName { return { type: 'entity', value: entity.name, variant: entity.variant } }
Synonym "synonym alias" = "~" entity:EntityName { return { type: 'synonym', value: entity.name } }

IntentData "intent data" = Samedent inner:(Entity/Sentence)+ EOL? { return inner }
IntentDefinition "intent definition"  = EOL? "%" entity:EntityName props:Props? EOL?
 	Indent data:IntentData+ Dedent
 	{ return { type: 'intent', props, name: entity.name, data } }

Prop "property" = key:[a-zA-Z_]* "=" value:[a-zA-Z_/]* [ ]* [,]? [ ]* { return { key: key.join(''), value: value.join('') } }
Props "properties" = "(" props:Prop+ ")" { return props }

EntityData "entity data" = Samedent inner:(Synonym/Sentence)+ EOL? { return inner }
EntityDefinition "entity definition" = EOL? "@" entity:EntityName props:Props? EOL?
	Indent data:EntityData* Dedent
	{ return { type: 'entity', props, ...entity, data: data.map(o => o[0]) } }

SynonymData "synonym data" = Samedent inner:Sentence+ EOL? { return inner }
SynonymDefinition "synonym definition" = EOL? "~" entity:EntityName EOL?
	Indent data:SynonymData* Dedent
	{ return { type: 'synonym', name: entity.name, data: data.map(o => o[0]) } }

Comment "comment" = "#" [ ]* value:(t:((!"\n")(!"\r\n") .) { return t.join('') })* EOL 
	{ return { type: 'comment', value: value.join('') } }

EOL=("\n"/"\r\n")+
