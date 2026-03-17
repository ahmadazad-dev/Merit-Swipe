USE Mystical_Adventure;
GO

-- Sung Jin-Woo needs a list of all dungeons he has entered, including their difficulty and 
-- current status. Create a View that shows DungeonID, Name, Difficulty, Boss, Status
-- and Only includes dungeons where Jin-Woo (HunterID = 1) has participated.
CREATE OR ALTER VIEW dungeon_missions AS 
(
	SELECT 
		d.DungeonID,
		d.Name,
		d.Difficulty,
		d.Boss,
		d.Status
	FROM Dungeons d
	RIGHT JOIN Hunter_Missions h
		ON d.DungeonID = h.DungeonID
	WHERE h.HunterID = 1
)
SELECT * FROM dungeon_missions

-- Audrey Hall suspects several Beyonders are losing control and might pose a threat.
--She needs a report on all Beyonders who are &quot;At Risk&quot; or &quot;Lost Control&quot;, along with
--their organization. Create a View that shows BeyonderID, Name, Path,
--PotionConsumption, Status, OrganizationName
CREATE OR ALTER VIEW beyonders_report AS
(
	SELECT 
		b.BeyonderID,
		b.Name AS Beyonder_Name,
		b.Path,
		b.PotionConsumption,
		b.Status,
		o.Name AS Organization_Name
	FROM Beyonders b
	LEFT JOIN Organizations o
		ON b.OrganizationID = o.OrganizationID
	WHERE Status IN ('At Risk','Lost Control')
)
SELECT * FROM beyonders_report

--Klein Moretti is monitoring all ongoing and pending missions across different
--organizations. Create a View that shows MissionID, Title, Type, DifficultyLevel, Status,
--OrganizationName
CREATE OR ALTER VIEW ongoing_pending_missions AS (
	SELECT 
		m.*,
		o.Name
	FROM Missions m
	JOIN Mission_Assignments ma
		ON m.MissionID = ma.MissionID
	JOIN Agents a
		ON a.AgentID = ma.AgentID
	JOIN Organizations o
		ON a.OrganizationID = o.OrganizationID
	WHERE m.Status IN ('Pending', 'Ongoing')
)

--Audrey Hall is searching for missions that have repeatedly failed, especially when
--high-risk Beyonders were involved. She needs a summary of the most dangerous
--missions where multiple agents/hunters have failed, sorted by failure count. Create
--a View that displays MissionID, Title, TimesFailed, MostCommonHunter,
--MostCommonBeyonder, HighRiskArtifact and If a High-Risk Artifact was linked, display
--its name.
CREATE VIEW DangerousMissionSummary
AS
SELECT
    m.MissionID,
    m.Title,
    (
        SELECT COUNT(*)
        FROM Mission_Assignments ma
        WHERE ma.MissionID = m.MissionID
    ) AS TimesFailed,
    ISNULL((
        SELECT TOP 1 h.Name
        FROM Mission_Assignments ma
        JOIN Hunters h ON ma.HunterID = h.HunterID
        WHERE ma.MissionID = m.MissionID
          AND ma.HunterID IS NOT NULL
        GROUP BY h.Name
        ORDER BY COUNT(*) DESC
    ), 'No Hunter Assigned') AS MostCommonHunter,
    ISNULL((
        SELECT TOP 1 b.Name
        FROM Artifacts a
        JOIN Beyonders b ON a.GuardianID = b.BeyonderID
        WHERE a.MissionID = m.MissionID
          AND b.Status IN ('At Risk', 'Lost Control')
        GROUP BY b.Name
        ORDER BY COUNT(*) DESC
    ), 'No High-Risk Beyonder') AS MostCommonBeyonder,
    CASE
        WHEN (
            SELECT TOP 1 a.Name
            FROM Artifacts a
            WHERE a.MissionID = m.MissionID
              AND a.RiskLevel IN ('High', 'Extreme')
        ) IS NOT NULL
        THEN 'YES - ' + (
            SELECT TOP 1 a.Name
            FROM Artifacts a
            WHERE a.MissionID = m.MissionID
              AND a.RiskLevel IN ('High', 'Extreme')
        )
        ELSE 'No High-Risk Artifact'
    END AS HighRiskArtifact

FROM Missions m
WHERE m.Status = 'Failed';
GO
SELECT * FROM DangerousMissionSummary

--Sherlock Holmes wants a quick list of the strongest S-Rank Hunters for an elite
--mission. Create a View that shows HunterID, Name, Guild, PowerLevel,
--OrganizationName and Only include hunters with Rank = &#39;S&#39;
CREATE OR ALTER VIEW strong_hunters AS (
	SELECT 
		h.HunterID,
		h.Name Hunter_Name,
		h.Guild,
		h.PowerLevel,
		o.Name Organization_Name
	FROM Hunters h
	JOIN Organizations o
		ON o.OrganizationID = h.OrganizationID
	WHERE Rank = 'S'
)
SELECT * FROM strong_hunters

--Go Gunhee wants a procedure to assign a Hunter to a Dungeon but only if they are
--not already assigned. Create a procedure which takes two inputs (hunterid, dungeonid)
--and assigns the specified hunter to the dungeon if not already assigned.
CREATE OR ALTER PROCEDURE assign_hunter_to_dungeon 
	@hunterId INT,
	@dungeonId INT
AS 
BEGIN 
	IF NOT EXISTS (SELECT 1 FROM Dungeons WHERE DungeonID = @DungeonID)
    BEGIN
        RETURN;
    END
	IF NOT EXISTS (SELECT 1 FROM Hunters WHERE HunterID = @hunterId)
    BEGIN
        RETURN;
    END
	UPDATE Hunter_Missions
	SET HunterID = @hunterId
	WHERE DungeonID = (
		SELECT DungeonID
		FROM Hunter_Missions
		WHERE HunterID IS NULL AND DungeonID = @dungeonId
	)
END
EXEC assign_hunter_to_dungeon @hunterId = 12, @dungeonId = 13

-- Sung Jin-Woo requests a procedure to mark dungeons as &quot;Cleared&quot; once all
-- assigned hunters have completed their mission.
CREATE OR ALTER PROCEDURE markdungeon_as_cleared
	@dungeonId INT
AS 
BEGIN
	IF NOT EXISTS (SELECT 1 FROM Dungeons WHERE DungeonID = @DungeonID)
    BEGIN
        RETURN;
    END
	IF NOT EXISTS (SELECT 1 FROM Hunter_Missions WHERE DungeonID = @DungeonID)
    BEGIN
        RETURN;
    END

	UPDATE Dungeons
	SET Status = 'Cleared'
	WHERE DungeonID = @dungeonId
END

--Audrey Hall wants automatic logging whenever an artifact is retrieved/recovered.
--Create a procedure to insert info in intelligence reports. For example, INSERT INTO
--Intelligence_Reports (MissionID, SubmittedBy, ReportContent, DateSubmitted) VALUES
--(@MissionID, &#39;Audrey Hall&#39;, &#39;Artifact successfully retrieved and sealed.&#39;, GETDATE());
CREATE OR ALTER PROCEDURE insert_intellegence_report 
	@missionId INT,
	@submittedBy VARCHAR(50),
	@reportcontent VARCHAR(500),
	@datesubmitted DATETIME2
AS
BEGIN
	INSERT INTO Intelligence_Reports (MissionID, SubmittedBy, ReportContent, DateSubmitted)
	VALUES (@missionId, @submittedBy, @reportcontent, @datesubmitted)
END	
EXEC insert_intellegence_report @missionId = 6, @submittedBy = 'Arthas Moonshadow', @reportcontent = 'Second team sent to retrieve Golden Scarab also failed.', @datesubmitted = DATEADD(day, -5, GETDATE()),

--Go Gunhee requires hunters to be promoted automatically when their PowerLevel
--increases above thresholds. Create a procedure which takes a hunter id and sets rank
--as per following
--a. Rank ‘S’ when power &gt;= 9000
--b. Rank ‘A’ when power &gt;= 7500
--c. Rank ‘B’ when power &gt;= 5000
CREATE OR ALTER PROCEDURE promote_rank 
	@hunterId INT
AS
BEGIN
	UPDATE Hunters
	SET Rank = 
		CASE 
			WHEN PowerLevel >= 9000 THEN 'S'
			WHEN PowerLevel >= 7500 THEN 'A'
			ELSE 'B'
		END 
	WHERE HunterID = @hunterId
END

--Klein Moretti has intercepted multiple failed missions related to the Necronomicon and
--other dark artifacts. He needs a procedure that:
--a. Identifies agents/hunters who repeatedly failed artifact-related missions.
--b. Logs them as &quot;Forbidden Knowledge&quot; suspects in the Intelligence Reports.
--c. Stored Procedure Requirements:
--i. If an agent/hunter failed at least 3 missions involving high-risk artifacts,
--log their details.
--ii. Insert a warning into Intelligence Reports.