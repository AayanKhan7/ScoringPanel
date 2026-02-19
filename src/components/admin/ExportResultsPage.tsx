import { Download } from 'lucide-react';
import { Event, Team, Score, Judge } from '../../types';
import { exportRound1ScoresToPDF, exportRound2ResultsToPDF } from '../../utils/pdfExport';
import { listRoundOneResults } from '../../api/scoringApi';
import { toast } from 'sonner';

interface ExportResultsPageProps {
  events: Event[];
  teams: Team[];
  scores: Score[];
  judges: Judge[];
}

export function ExportResultsPage({ events, teams, scores, judges }: ExportResultsPageProps) {
  const handleExportAllRound1Scores = async () => {
    if (events.length === 0) {
      alert('No events available. Please create an event first.');
      return;
    }
    
    const toastId = toast.loading('Exporting Round 1 scores to PDF...');
    
    try {
      const mainEvent = events[0];
      const allDomains = ['fintech_ecommerce', 'health_biotech', 'agritech_rural', 'sustainable_smart_cities', 'skills_edtech'];
      const domainNames: Record<string, string> = {
        fintech_ecommerce: 'Fintech and E-commerce',
        health_biotech: 'Health and BioTech',
        agritech_rural: 'Agri-Tech & Rural Empowerment',
        sustainable_smart_cities: 'Sustainable solutions and smart cities',
        skills_edtech: 'Skills and Edtech'
      };

      const domainScoresMap = new Map<string, any[]>();
      
      for (const domainKey of allDomains) {
        const results = await listRoundOneResults(domainKey).catch(() => []);
        domainScoresMap.set(domainKey, results || []);
      }

      exportRound1ScoresToPDF(domainNames, allDomains, domainScoresMap, teams, mainEvent.name);
      
      toast.dismiss(toastId);
      toast.success('Round 1 scores exported to PDF successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss(toastId);
      toast.error('Failed to export Round 1 scores');
    }
  };

  const handleExportRound2Results = async () => {
    if (events.length === 0) {
      alert('No events available.');
      return;
    }
    
    const toastId = toast.loading('Exporting Round 2 results to PDF...');
    try {
      const mainEvent = events[0];
      // Filter top 3 teams per domain from the scores data
      const domainMap = new Map<string, any[]>();
      scores.forEach(score => {
        const teamInfo = teams.find(t => t.id === score.teamId);
        if (teamInfo) {
          const domain = teamInfo.domain;
          if (!domainMap.has(domain)) {
            domainMap.set(domain, []);
          }
          domainMap.get(domain)!.push({ ...score, teamName: teamInfo.teamName });
        }
      });

      const topTeams: any[] = [];
      domainMap.forEach((domainScores, domain) => {
        const teamScores = new Map<string, number[]>();
        domainScores.forEach(score => {
          if (!teamScores.has(score.teamId)) {
            teamScores.set(score.teamId, []);
          }
          teamScores.get(score.teamId)!.push(score.totalScore);
        });

        const teamsWithAverage = Array.from(teamScores.entries()).map(([teamId, scoreArray]) => {
          const avgScore = scoreArray.reduce((a, b) => a + b, 0) / scoreArray.length;
          const teamInfo = teams.find(t => t.id === teamId);
          return {
            id: teamId,
            teamName: teamInfo?.teamName || 'Unknown',
            domain: domain,
            finalScore: avgScore,
            rank: ''
          };
        });

        teamsWithAverage.sort((a, b) => b.finalScore - a.finalScore);
        topTeams.push(...teamsWithAverage.slice(0, 3));
      });

      topTeams.sort((a, b) => b.finalScore - a.finalScore);
      topTeams.forEach((team, index) => {
        team.rank = index + 1;
      });

      exportRound2ResultsToPDF(teams, mainEvent.name, topTeams);
      toast.dismiss(toastId);
      toast.success('Round 2 results exported to PDF successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss(toastId);
      toast.error('Failed to export Round 2 results');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="size-5 sm:size-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Export Results</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Download competition data in PDF format</p>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Round 1 Export */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="size-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">Round 1 Scores</h2>
              <p className="text-sm text-slate-600 mt-1">
                Export all Round 1 scores organized by domain with judge details in PDF format
              </p>
            </div>
          </div>
          
          <div className="mb-5 pl-1">
            <p className="text-xs font-semibold text-slate-700 mb-2">Includes:</p>
            <ul className="text-sm text-slate-600 space-y-1.5">
              <li>• All domain scores with judge names</li>
              <li>• Team problem statements</li>
              <li>• Individual criterion scores</li>
              <li>• Aggregated results with rankings</li>
              <li>• Top 3 teams by domain</li>
            </ul>
          </div>

          <button
            onClick={handleExportAllRound1Scores}
            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-black rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Download className="size-5" />
            Export Round 1 as PDF
          </button>
        </div>

        {/* Round 2 Export */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="size-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">Round 2 Results</h2>
              <p className="text-sm text-slate-600 mt-1">
                Export Round 2 scores with external judge evaluations in PDF format
              </p>
            </div>
          </div>
          
          <div className="mb-5 pl-1">
            <p className="text-xs font-semibold text-slate-700 mb-2">Includes:</p>
            <ul className="text-sm text-slate-600 space-y-1.5">
              <li>• Top 3 teams per domain</li>
              <li>• External judge scores</li>
              <li>• Final rankings</li>
              <li>• Complete score breakdown</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportRound2Results}
              className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-black rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Download className="size-5" />
              Export Round 2 as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Export Information</h3>
            <p className="text-sm text-blue-800">
              Exported PDF files will be downloaded to your default downloads folder. 
              The PDF files include well-structured tables and multiple sections with detailed scoring information, making them suitable for printing and professional distribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
