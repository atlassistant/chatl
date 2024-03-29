{ 
	var cur_step = 0;
    var level = 0;
    
    function flattenProps(obj) {
    	return (obj.props || []).reduce((prev, cur) => {
          	prev[cur.key] = cur.value;
          	return prev;
          }, {});
    }
    
    function reduceElement(prev, cur) {
    	prev[cur.name] = {
        	props: flattenProps(cur),
            data: cur.data,
        };
    	return prev;
    }
}

start=data:(IntentDefinition/EntityDefinition/SynonymDefinition/Comment/EOL)+
{ 
	const r = {
    	intents: data.filter(o => o.type === 'intent').reduce(reduceElement, {}),
        entities: {},
        synonyms: data.filter(o => o.type === 'synonym').reduce(reduceElement, {}),
        comments: data.filter(o => o.type === 'comment'),
    };
            
    for (const entity of data.filter(o => o.type === 'entity')) {
    	if (!r.entities[entity.name]) {
        	r.entities[entity.name] = { variants: {} };
        }
        
        r.entities[entity.name].props = {
        	...r.entities[entity.name].props,
        	...flattenProps(entity),
        };
        
        if (entity.variant) {
        	r.entities[entity.name].variants[entity.variant] = entity.data;
        } else {
        	r.entities[entity.name].data = entity.data;
        }
    }
    
    return r;
}

Samedent "correct indentation" = s:[ \t]* &{ return s.length === level; }
Indent = &(i:[ \t]* &{ cur_step=i.length; level+=cur_step; return true; })
Dedent = &(i:[ \t]* &{ level-=cur_step; return true; })

EntityName "entity name"  = "[" 
	name:(t:((!"]")(!"?")(!"#") .) { return t.join(''); })+ "#"? variant:(t:((!"]")(!"?") .) { return t.join(''); })* o:("?")? "]" { return { name: name.join(''), optional: o != null, variant: variant.join('') || null }; }
AnyText "any text" = v:(t:((!"\n")(!"\r\n")(!"@[")(!"~[") .) { return t.join(''); })+ { return v.join(''); }

Sentence "sentence" = text:AnyText+ { return { type: 'text', value: text.join('') } }
Entity "entity alias" = "@" entity:EntityName { return { type: 'entity', value: entity.name, variant: entity.variant } }
Synonym "synonym alias" = "~" entity:EntityName { return { type: 'synonym', value: entity.name } }

IntentSynonym "synonym inside intent" = "~" entity:EntityName { return { type: 'synonym', value: entity.name, optional: entity.optional } }
IntentData "intent data" = Samedent inner:(Entity/IntentSynonym/Sentence)+ EOL? { return inner }
IntentDefinition "intent definition"  = EOL? "%" entity:EntityName props:Props? EOL?
 	Indent data:IntentData+ Dedent
 	{ return { type: 'intent', props, name: entity.name, data } }

PropValue "property value" = "`" v:[^\r^\n^`]* "`" { return v } / v:[^\r^\n^,^)]* { return v }
Prop "property" = key:[^=^\n^\r\n]* "=" value:PropValue [ ]* [,]? [ ]* { return { key: key.join(''), value: value.join('') } }
Props "properties" = "(" props:Prop+ ")" { return props }

EntityData "entity data" = Samedent inner:(Synonym/Sentence)+ EOL? { return inner }
EntityDefinition "entity definition" = EOL? "@" entity:EntityName props:Props? EOL?
	Indent data:EntityData* Dedent
	{ return { type: 'entity', props, ...entity, data: data.map(o => o[0]) } }

SynonymData "synonym data" = Samedent inner:Sentence+ EOL? { return inner }
SynonymDefinition "synonym definition" = EOL? "~" entity:EntityName props:Props? EOL?
	Indent data:SynonymData* Dedent
	{ return { type: 'synonym', props, name: entity.name, data: data.map(o => o[0]) } }

Comment "comment" = "#" [ ]* value:(t:((!"\n")(!"\r\n") .) { return t.join('') })* EOL? 
	{ return { type: 'comment', value: value.join('') } }

EOL=("\n"/"\r\n")+
