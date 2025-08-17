require('dotenv').config();
const LeetCodeBot = require('./index');

class DailyAutomation {
  constructor() {
    this.bot = new LeetCodeBot();
  }

  async runDailyAutomated() {
    console.log('🚀 Daily Automated LeetCode Bot Starting...');
    console.log('📅 Date:', new Date().toLocaleDateString());
    
    try {
      // Show current progress
      const currentCounts = this.bot.getSolvedProblemsCount();
      console.log('📊 Current progress:', currentCounts);
      
      // Automatically solve 3 problems with difficulty balance
      const solved = await this.bot.solveProblemsWithDifficultyBalance(3);
      
      if (solved > 0) {
        console.log(`\n✅ Successfully solved ${solved} problems!`);
        console.log('📁 Solutions saved in difficulty-based folders');
        
        // Show updated progress
        const finalCounts = this.bot.getSolvedProblemsCount();
        console.log('📊 Updated progress:', finalCounts);
        
        return true;
      } else {
        console.log('⚠️  No new problems were solved (all attempted problems may already be solved)');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error in daily automation:', error);
      return false;
    }
  }

  async runWeeklyChallenge() {
    console.log('🏆 Weekly Challenge Mode - Solving 7 problems!');
    
    try {
      const solved = await this.bot.solveProblemsWithDifficultyBalance(7);
      console.log(`\n🎉 Weekly Challenge Complete! Solved ${solved} problems!`);
      return solved;
    } catch (error) {
      console.error('❌ Error in weekly challenge:', error);
      return 0;
    }
  }
}

// Auto-run based on command line arguments
async function main() {
  const automation = new DailyAutomation();
  const args = process.argv.slice(2);
  
  if (args.includes('weekly')) {
    await automation.runWeeklyChallenge();
  } else {
    await automation.runDailyAutomated();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DailyAutomation;
