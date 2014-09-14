
-- example (old) notifications that will show up in dashboard
INSERT INTO "notifications" VALUES(NULL,1409902233,2,'envelope','daily status report sent');
INSERT INTO "notifications" VALUES(NULL,1409934607,2,'user','greenfrog: reset all hosts in E27');
INSERT INTO "notifications" VALUES(NULL,1409934707,2,'comment','greenfrog commented on E27');
INSERT INTO "notifications" VALUES(NULL,1409952612,2,'toggle-off','E27: scheduled power down success');
INSERT INTO "notifications" VALUES(NULL,1409985633,2,'toggle-on','E27: scheduled power up success');
INSERT INTO "notifications" VALUES(NULL,1409988624,2,'envelope','daily status report sent');
INSERT INTO "notifications" VALUES(NULL,1410004353,2,'warning','More than 10 hosts unreachable!');

-- some amtc option sets
INSERT INTO "optionsets" VALUES(1,'DASH / No TLS','Uses DASH',0,1,1,1,0,0,200,10,'/tmp/test2.pass','');
INSERT INTO "optionsets" VALUES(2,'DASH / TLS / VerifyCertSkip','Skips TLS certificate verification',0,1,1,1,1,1,175,10,'/tmp/test2.pass','');
INSERT INTO "optionsets" VALUES(3,'DASH / TLS / VerifyCert','Most secure optionset',0,1,1,1,1,0,150,15,'/tmp/test3.pass','/tmp/my.ca.crt');
INSERT INTO "optionsets" VALUES(4,'EOI / No TLS - AMT v5','For old hardware with AMT 5.0 (around 2008)',1,0,0,0,0,0,100,10,'/tmp/testv5.pass',NULL);
INSERT INTO "optionsets" VALUES(5,'EOI / No TLS - AMT v6-8','EOI + No TLS = the fastest. But only does digest auth via http.',0,0,1,1,0,0,250,6,'/tmp/test1.pass','');

-- example OUs ...
-- comes in via minimal already: 
-- INSERT INTO "ous" VALUES(1,NULL,NULL,'ROOT','root');
-- INSERT INTO "ous" VALUES(2,1,NULL,'Student labs','Computer rooms');
INSERT INTO "ous" VALUES(3,2,NULL,'E Floor','All rooms on E floor',0,0);
INSERT INTO "ous" VALUES(4,2,NULL,'D Floor','All rooms on D floor',0,0);
INSERT INTO "ous" VALUES(5,1,NULL,'Course rooms','Playground',0,0);
INSERT INTO "ous" VALUES(6,5,NULL,'Room A1','No optionset yet',0,0);
INSERT INTO "ous" VALUES(7,5,NULL,'Room A2','Testing ... No optionset, too',0,0);
-- and some real rooms
INSERT INTO "ous" VALUES(8,3,3,'E 19','',24.5,1);
INSERT INTO "ous" VALUES(9,3,2,'E 26.1','',32.3,0);
INSERT INTO "ous" VALUES(10,3,2,'E 26.3','',32.3,0);
INSERT INTO "ous" VALUES(11,3,1,'E 27','',32.3,1);
INSERT INTO "ous" VALUES(12,4,4,'D 11','',24.5,0);
INSERT INTO "ous" VALUES(13,4,4,'D 12','',24.5,0);
INSERT INTO "ous" VALUES(14,4,4,'D 13','',32.3,0);

-- put some hosts into two of the rooms
INSERT INTO "hosts" VALUES(1,11,'labpc-e27-160',1);
INSERT INTO "hosts" VALUES(2,11,'labpc-e27-161',1);
INSERT INTO "hosts" VALUES(3,11,'labpc-e27-162',1);
INSERT INTO "hosts" VALUES(4,11,'labpc-e27-163',1);
INSERT INTO "hosts" VALUES(5,11,'labpc-e27-164',1);
INSERT INTO "hosts" VALUES(6,11,'labpc-e27-165',1);
INSERT INTO "hosts" VALUES(7,11,'labpc-e27-166',1);
INSERT INTO "hosts" VALUES(8,11,'labpc-e27-167',1);
INSERT INTO "hosts" VALUES(9,11,'labpc-e27-168',1);
INSERT INTO "hosts" VALUES(10,11,'labpc-e27-169',1);
INSERT INTO "hosts" VALUES(11,8,'labpc-e19-18',1);
INSERT INTO "hosts" VALUES(12,8,'labpc-e19-19',1);
INSERT INTO "hosts" VALUES(13,8,'labpc-e19-20',1);
INSERT INTO "hosts" VALUES(14,8,'labpc-e19-21',0);
INSERT INTO "hosts" VALUES(15,8,'labpc-e19-22',0);