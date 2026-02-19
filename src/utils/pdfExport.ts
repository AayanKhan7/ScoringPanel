import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Team, Score, Judge } from '../types';

interface RoundOneResultData {
  judgeName: string;
  teamId: string;
  teamName: string;
  problemStatement: string;
  problemIdentification: number;
  innovationCreativity: number;
  feasibilityPracticality: number;
  marketImpactPotential: number;
  technologyDomainRelevance: number;
  pitchDeliveryQA: number;
  bonus: number;
  total: number;
}

/**
 * Export Round 1 Scores to PDF with multiple sections
 */
export function exportRound1ScoresToPDF(
  domains: { [key: string]: string },
  allDomains: string[],
  domainScoresMap: Map<string, any[]>,
  teams: Team[],
  eventName: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let pageNumber = 1;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 15;

  const addPageNumber = () => {
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 10);
  };

  const addNewPage = () => {
    addPageNumber();
    pageNumber++;
    doc.addPage();
    yPosition = 15;
  };

  const checkPageSpace = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      addNewPage();
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(`Round 1 Scoring Results - ${eventName}`, 15, yPosition);
  yPosition += 12;

  // Export date
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 15, yPosition);
  yPosition += 10;

  const teamTotals = new Map<string, { teamId: string; teamName: string; domain: string; totalSum: number; count: number }>();

  // Process each domain
  let isFirstDomain = true;
  for (const domainKey of allDomains) {
    const domainName = domains[domainKey] || domainKey;
    const results = domainScoresMap.get(domainKey) || [];

    if (results.length === 0) {
      const domainTeams = teams.filter(t => (t as any).domainKey === domainKey || t.domain === domainKey);
      if (domainTeams.length === 0) continue;
    }

    // Start new page for each domain (except the first one)
    if (!isFirstDomain) {
      addNewPage();
    }
    isFirstDomain = false;

    // Domain header
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text(`${domainName}`, 15, yPosition);
    yPosition += 8;

    // Prepare table data
    const tableData: any[] = [];

    if (results.length > 0) {
      // Group by judge
      const groupedByJudge = new Map<string, any[]>();
      results.forEach((r: any) => {
        const judgeKey = r.judgeName || r.judgeId || 'Unknown Judge';
        if (!groupedByJudge.has(judgeKey)) groupedByJudge.set(judgeKey, []);
        groupedByJudge.get(judgeKey)!.push(r);

        // Calculate team totals
        const teamKey = r.teamId || r.teamName;
        if (teamKey) {
          const existing = teamTotals.get(teamKey) || {
            teamId: r.teamId || '',
            teamName: r.teamName || '',
            domain: domainName,
            totalSum: 0,
            count: 0
          };
          existing.totalSum += Number(r.total ?? 0);
          existing.count += 1;
          teamTotals.set(teamKey, existing);
        }
      });

      // Add scores by judge with individual signature sections
      const judgeEntries = Array.from(groupedByJudge.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      judgeEntries.forEach(([judgeName, judgeScores], judgeIndex) => {
        // Create a mini table for this judge
        const judgeTableData: any[] = [];
        
        judgeScores.forEach((item: any, index: number) => {
          const totalScore = Number(item.total ?? 0).toFixed(1);
          judgeTableData.push([
            index + 1,
            item.teamId || '',
            item.teamName || '',
            item.problemIdentification ?? 0,
            item.innovationCreativity ?? 0,
            item.feasibilityPracticality ?? 0,
            item.marketImpactPotential ?? 0,
            item.technologyDomainRelevance ?? 0,
            item.pitchDeliveryQA ?? 0,
            item.bonus ?? 0,
            totalScore
          ]);
        });

        // Draw judge name
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text(`Judge: ${judgeName}`, 15, yPosition);
        doc.setFont(undefined, 'normal');
        yPosition += 8;

        // Draw the table for this judge
        autoTable(doc, {
          head: [['S.No', 'Team ID', 'Team Name', 'Prob ID', 'Innov', 'Feas', 'Market', 'Tech', 'Pitch', 'Bonus', 'Total']],
          body: judgeTableData,
          startY: yPosition,
          margin: 10,
          styles: {
            fontSize: 7,
            cellPadding: 1.5,
            overflow: 'linebreak',
            valign: 'middle'
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 7
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 15 },
            2: { cellWidth: 25 },
            3: { halign: 'center', cellWidth: 12 },
            4: { halign: 'center', cellWidth: 12 },
            5: { halign: 'center', cellWidth: 11 },
            6: { halign: 'center', cellWidth: 13 },
            7: { halign: 'center', cellWidth: 11 },
            8: { halign: 'center', cellWidth: 11 },
            9: { halign: 'center', cellWidth: 11 },
            10: { halign: 'center', cellWidth: 12 }
          },
          didDrawPage: (data: any) => {
            yPosition = data.cursor.y;
          }
        });

        // Add signature section right after this judge's table
        yPosition += 8;
        if (yPosition > pageHeight - 40) {
          addPageNumber();
          pageNumber++;
          doc.addPage();
          yPosition = 15;
        }

        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text('Signature: ___________________________', pageWidth - 85, yPosition);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`(${judgeName})`, pageWidth - 85, yPosition + 5);
        
        yPosition += 15;
      });

      // Add unscored teams
      const scoredTeamIds = new Set(results.map((r: any) => r.teamId));
      const domainTeams = teams.filter(t => (t as any).domainKey === domainKey || t.domain === domainKey || t.domain === domainName);
      const unscoredTeams = domainTeams.filter(t => !scoredTeamIds.has(t.id));

      if (unscoredTeams.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(200, 80, 60);
        doc.setFont(undefined, 'bold');
        doc.text('Unscored Teams', 15, yPosition);
        doc.setFont(undefined, 'normal');
        yPosition += 8;

        const unscoredTableData: any[] = [];
        unscoredTeams.forEach((team: any, index: number) => {
          unscoredTableData.push([
            index + 1,
            team.id || '',
            team.teamName || team.name || '',
            '', '', '', '', '', '', '', ''
          ]);
        });

        autoTable(doc, {
          head: [['S.No', 'Team ID', 'Team Name', 'Prob ID', 'Innov', 'Feas', 'Market', 'Tech', 'Pitch', 'Bonus', 'Total']],
          body: unscoredTableData,
          startY: yPosition,
          margin: 10,
          styles: {
            fontSize: 7,
            cellPadding: 1.5,
            overflow: 'linebreak',
            valign: 'middle'
          },
          headStyles: {
            fillColor: [200, 100, 80],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 7
          },
          alternateRowStyles: {
            fillColor: [255, 245, 245]
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 15 },
            2: { cellWidth: 25 },
            3: { halign: 'center', cellWidth: 12 },
            4: { halign: 'center', cellWidth: 12 },
            5: { halign: 'center', cellWidth: 11 },
            6: { halign: 'center', cellWidth: 13 },
            7: { halign: 'center', cellWidth: 11 },
            8: { halign: 'center', cellWidth: 11 },
            9: { halign: 'center', cellWidth: 11 },
            10: { halign: 'center', cellWidth: 12 }
          },
          didDrawPage: (data: any) => {
            yPosition = data.cursor.y + 10;
          }
        });
      }
    }
  }

  // Summary page
  addNewPage();
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Summary - All Teams Aggregated', 15, yPosition);
  yPosition += 10;

  const aggregatedData = Array.from(teamTotals.values())
    .sort((a, b) => (b.totalSum / b.count) - (a.totalSum / a.count))
    .map((item, index) => [
      index + 1,
      item.teamId,
      item.teamName,
      item.domain,
      item.count,
      item.totalSum.toFixed(1),
      (item.totalSum / item.count).toFixed(1)
    ]);

  if (aggregatedData.length > 0) {
    autoTable(doc, {
      head: [['Rank', 'Team ID', 'Team Name', 'Domain', 'Judges', 'Total', 'Avg']],
      body: aggregatedData,
      startY: yPosition,
      margin: 10,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 18 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { halign: 'center', cellWidth: 15 },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'center', cellWidth: 15 }
      }
    });
  }

  // Top 3 by Domain page
  addNewPage();
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Top 3 Teams by Domain', 15, yPosition);
  yPosition += 10;

  const top3Data: any[] = [];
  for (const domainKey of allDomains) {
    const domainName = domains[domainKey] || domainKey;
    const domainTeamsData = Array.from(teamTotals.values())
      .filter(t => t.domain === domainName || t.domain === domainKey)
      .sort((a, b) => (b.totalSum / b.count) - (a.totalSum / a.count))
      .slice(0, 3);

    if (domainTeamsData.length > 0) {
      top3Data.push([
        { content: domainName, styles: { fontStyle: 'bold', backgroundColor: [230, 230, 230] } },
        '', '', '', '', ''
      ]);

      domainTeamsData.forEach((team, index) => {
        top3Data.push([
          index + 1,
          team.teamId,
          team.teamName,
          team.count,
          team.totalSum.toFixed(1),
          (team.totalSum / team.count).toFixed(1)
        ]);
      });
    }
  }

  if (top3Data.length > 0) {
    autoTable(doc, {
      head: [['Rank', 'Team ID', 'Team Name', 'Judges', 'Total', 'Avg']],
      body: top3Data,
      startY: yPosition,
      margin: 10,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 22 },
        2: { cellWidth: 40 },
        3: { halign: 'center', cellWidth: 18 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 18 }
      }
    });
  }

  addPageNumber();

  // Save the PDF
  doc.save(`Round1_Scores_${eventName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
}

/**
 * Export Round 2 Results to PDF
 */
export function exportRound2ResultsToPDF(
  teams: Team[],
  eventName: string,
  topTeams: any[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 15;
  let pageNumber = 1;

  const addPageNumber = () => {
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 10);
  };

  const addNewPage = () => {
    addPageNumber();
    pageNumber++;
    doc.addPage();
    yPosition = 15;
  };

  // Title
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(`Round 2 Results - ${eventName}`, 15, yPosition);
  yPosition += 12;

  // Export date
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 15, yPosition);
  yPosition += 10;

  // Prepare table data
  const tableData = topTeams.map((team: any, index: number) => [
    index + 1,
    team.teamId || team.id || '',
    team.teamName || team.name || '',
    team.domain || '',
    team.finalScore?.toFixed(1) || team.round2Score?.toFixed(1) || '0.0',
    team.rank || ''
  ]);

  if (tableData.length > 0) {
    autoTable(doc, {
      head: [['Rank', 'Team ID', 'Team Name', 'Domain', 'Score', 'Position']],
      body: tableData,
      startY: yPosition,
      margin: 10,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [200, 100, 50],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 22 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 18 }
      }
    });
  } else {
    doc.setFontSize(12);
    doc.text('No Round 2 results available.', 15, yPosition);
  }

  addPageNumber();

  // Save the PDF
  doc.save(`Round2_Results_${eventName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
}
