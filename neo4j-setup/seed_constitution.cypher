// ============================================================================
// AMEXAN Universal Constitution — Neo4j Knowledge Layer
// Version: 1.0.0
//
// Live graph for Capability (UCE), Consent & Delegation (UCDE),
// Protocol (UPVE) and Learning & Competency (ULCE) reasoning.
//
// Aligns with SCHEMA-CONSTITUTION.md section 4 and the existing seed_kg.cypher
// vocabulary (Actor, Organization, Department, Ward, Team, HAS_*, MEMBER_OF).
// ============================================================================

// ==== CAPABILITY GRAPH (UCE) + dependencies ====
MERGE (rx:Credential {capabilityId:'CAP-RX-0001', name:'Prescription Authority'})
MERGE (admit:Credential {capabilityId:'CAP-AD-0001', name:'Admission Authority'})
MERGE (dgn:Credential {capabilityId:'CAP-DG-0001', name:'Order Diagnostics'})
MERGE (surg:Credential {capabilityId:'CAP-SU-0001', name:'Surgical Privilege'})
MERGE (triage:Credential {capabilityId:'CAP-TR-0001', name:'Triage'})

// capability dependency (UCE): a capability may REQUIRE another
MERGE (admit)-[:REQUIRES]->(triage)
MERGE (surg)-[:REQUIRES]->(rx)
MERGE (dgn)-[:REQUIRES]->(triage)
MERGE (rx)-[:REQUIRES]->(triage)

// ==== PROTOCOL graph (UPVE) ====
MERGE (p_trauma:Protocol {protocolId:'PRO-001', version:'1.0.0', disease:'Trauma', status:'active'})
MERGE (p_lbo:Protocol {protocolId:'PRO-004', version:'1.3.0', disease:'Large Bowel Obstruction', status:'active'})

MERGE (ph_tr:Phase {name:'Resuscitate'})
MERGE (ph_dx:Phase {name:'Diagnose'})
MERGE (ph_tx:Phase {name:'Treat'})

MERGE (p_trauma)-[:HAS_PHASE]->(ph_tr)
MERGE (p_trauma)-[:HAS_PHASE]->(ph_dx)
MERGE (p_lbo)-[:HAS_PHASE]->(ph_dx)
MERGE (p_lbo)-[:HAS_PHASE]->(ph_tx)

// ==== CONSENT & DELEGATION (UCDE) ====
MERGE (grantor:Actor {actorId:'act-patient-0001', amxid:'AMX-P0001', actorType:'person'})
MERGE (recipient:Actor {actorId:'act-doctor-0001', amxid:'AMX-D0001', actorType:'person'})
MERGE (delegate:Actor {actorId:'act-nurse-0001', amxid:'AMX-N0001', actorType:'person'})

MERGE (consent:Consent {consentId:'consent-0001', resource:'medical-record', purpose:'care'})
MERGE (delegation:Delegation {delegationId:'delegation-0001', authority:'ward-round'})

// grantor grants a delegation targeted at a delegate
MERGE (grantor)-[:GRANTS]->(delegation)-[:TO]->(delegate)
// grantor consents a recipient to access a guardian resource
MERGE (grantor)-[:CONSENTS_ACCESS]->(consent)

// ==== ORG + CAPABILITY-AWARE REFERRAL (UCE) ====
MERGE (clinic:Organization {orgId:'ORG-0001', name:'AMEXAN Hospital'})
MERGE (surgeon:Actor {actorId:'act-surgeon-0001', name:'Dr. Surgeon', actorType:'person'})
MERGE (surgeon)-[:MEMBER_OF]->(clinic)
MERGE (surgeon)-[:HAS_CAPABILITY]->(surg)
MERGE (surgeon)-[:HAS_CAPABILITY]->(dgn)

// ==== COMPETENCY & EDUCATION (ULCE) ====
MERGE (comp:Competency {competencyId:'CMP-001', domain:'emergency', level:'advanced'})
MERGE (mentor:Actor {actorId:'act-mentor-0001', name:'Dr. Mentor', actorType:'person'})
MERGE (learner:Actor {actorId:'act-learner-0001', name:'Dr. Learner', actorType:'person'})
MERGE (learner)-[:DEMONSTRATED]->(comp)
MERGE (comp)-[:VALIDATED_BY]->(mentor)
MERGE (mentor)-[:SUPERVISES]->(learner)

// ==== PREFERENCE (UPrE) ====
MERGE (grLang:Preference {preferenceId:'pr-0001', category:'language', value:'English'})
MERGE (grantor)-[:PREFERS]->(grLang)

// ==== CARE WORKFLOW aligned with existing seed_kg ====
MERGE (doctor:Actor {actorId:'act-doctor-0002', name:'Doctor', actorType:'person'})
MERGE (patient:Actor {actorId:'PAT-P0001', name:'Patient', actorType:'person'})
MERGE (patEnc:Encounter {encounterId:'enc-000001', orgId:'ORG-0001', patientId:'PAT-P0001'})
MERGE (doctor)-[:TREATS]->(patient)
MERGE (patient)-[:OWNS]->(patEnc)
MERGE (doctor)-[:AUTHORED]->(patEnc)

// ==== MARKETPLACE graph (UME) ====
MERGE (publisher:Actor {actorId:'act-publisher-0001', name:'Stroke Center', actorType:'organization'})
MERGE (strokePkg:Module {moduleId:'mod-stroke-0001', name:'Stroke Package', category:'clinical', version:'1.0.0'})
MERGE (strokePkg)-[:EXTENDS]->(surg)
MERGE (strokePkg)-[:REQUIRES]->(dgn)
MERGE (clinic)-[:INSTALLED]->(strokePkg)
MERGE (publisher)-[:PUBLISHED]->(strokePkg)

// referral candidates who can deliver the stroke service within the org
MERGE (neuroProvider:Actor {actorId:'act-neuro-0001', name:'Dr. Neuro', actorType:'person'})
MERGE (neuroProvider)-[:MEMBER_OF]->(clinic)
MERGE (neuroProvider)-[:HAS_CAPABILITY]->(rx)

// ============ QUERY EXAMPLES (mirror SCHEMA-CONSTITUTION.md sec 4) ============

// Capability reasoning: what can a given actor do in an org?
// MATCH (a:Actor {actorId: $actorId})-[:MEMBER_OF]->(o:Organization)
// OPTIONAL MATCH (a)-[:HAS_CAPABILITY]->(c:Capability)
// RETURN o, collect(c.name) AS capabilities;

// Referral candidates (capability-aware) for a service within an org:
// MATCH (enc:Encounter {encounterId: $encounterId})-[:LOCATED_IN]->(o:Organization {orgId: $orgId})
// MATCH (provider:Actor)-[:MEMBER_OF]->(o)
// WHERE (provider)-[:HAS_CAPABILITY]->(:Capability {name: $service})
// RETURN provider AS candidate;

// Delegation chain: who may act for whom, and on what authority?
// MATCH (delegator:Actor)-[:GRANTS]->(d:Delegation)-[:TO]->(delegate:Actor)
// RETURN delegator.amxid, delegate.amxid, d.authority, d.scope;