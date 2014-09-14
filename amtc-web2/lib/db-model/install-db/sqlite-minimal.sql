
--
-- Minimal initial set of records to let amtc-web look ok after initial install
--

-- example OUs ...
INSERT INTO "ous" VALUES(1,NULL,NULL,'ROOT','root',0,0);
INSERT INTO "ous" VALUES(2,1,NULL,'Student labs','Computer rooms (empty example OU)',0,0);

-- "system" users ... (origin for jobs and notifications)
INSERT INTO "users" VALUES(1,1,1,1,1,'admin'  ,'amtc-web system account');
INSERT INTO "users" VALUES(2,1,1,0,1,'spooler','cron-based job spooler' );

-- example notification that will show up in dashboard
INSERT INTO "notifications" (user_id,ntype,message) values (1,'warning','Congrats, amtc-web installed!');
