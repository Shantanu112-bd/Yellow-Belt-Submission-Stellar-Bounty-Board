import { motion } from 'motion/react';
import { BountyButton } from './bounty-button';
import { Coins, Users, Trophy, TrendingUp } from 'lucide-react';
import { useBounties } from '../../hooks/useBounties';
import { stroopsToXlm } from '../../lib/stellar-client';
import { useMemo } from 'react';

export function Hero() {
  const { bounties } = useBounties();

  const stats = useMemo(() => {
    let totalPaid = 0;
    const solvers = new Set<string>();

    bounties.forEach((b: any) => {
      if ((b.status === 2 || b.status === 'Completed') && b.solver) {
        totalPaid += Number(stroopsToXlm(b.reward));
        solvers.add(String(b.solver));
      }
    });

    return [
      { icon: Trophy, value: bounties.length.toLocaleString(), label: 'Bounties' },
      { icon: Coins, value: `${totalPaid.toLocaleString()} XLM`, label: 'Paid' },
      { icon: Users, value: solvers.size.toLocaleString(), label: 'Solvers' },
    ];
  }, [bounties]);

  // Floating shapes animation
  const floatingShapes = [
    { size: 120, delay: 0, duration: 20, x: '10%', y: '20%' },
    { size: 80, delay: 2, duration: 15, x: '80%', y: '30%' },
    { size: 100, delay: 4, duration: 18, x: '60%', y: '70%' },
    { size: 60, delay: 1, duration: 12, x: '20%', y: '80%' },
    { size: 90, delay: 3, duration: 16, x: '90%', y: '60%' },
  ];

  // Blockchain nodes
  const nodes = [
    { x: '15%', y: '25%', size: 12, delay: 0 },
    { x: '35%', y: '35%', size: 8, delay: 0.5 },
    { x: '55%', y: '30%', size: 10, delay: 1 },
    { x: '75%', y: '40%', size: 14, delay: 1.5 },
    { x: '85%', y: '25%', size: 9, delay: 2 },
    { x: '25%', y: '65%', size: 11, delay: 0.8 },
    { x: '45%', y: '70%', size: 7, delay: 1.2 },
    { x: '65%', y: '75%', size: 13, delay: 1.8 },
  ];

  const connections = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 5, to: 6 },
    { from: 6, to: 7 },
    { from: 1, to: 5 },
    { from: 2, to: 6 },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden pt-[72px]">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

      {/* Gradient Mesh Overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px]" />
      </div>

      {/* Floating Geometric Shapes */}
      {floatingShapes.map((shape, index) => (
        <motion.div
          key={`shape-${index}`}
          className="absolute pointer-events-none"
          style={{
            left: shape.x,
            top: shape.y,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm rounded-lg rotate-45" />
        </motion.div>
      ))}

      {/* Blockchain Node Network Illustration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full">
          {/* Connections */}
          {connections.map((conn, index) => {
            const fromNode = nodes[conn.from];
            const toNode = nodes[conn.to];
            return (
              <motion.line
                key={`connection-${index}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="url(#gradient)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{
                  duration: 2,
                  delay: fromNode.delay,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            );
          })}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>

        {/* Nodes */}
        {nodes.map((node, index) => (
          <motion.div
            key={`node-${index}`}
            className="absolute"
            style={{
              left: node.x,
              top: node.y,
              width: node.size,
              height: node.size,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 3,
              delay: node.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary blur-md" />
          </motion.div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Earn Crypto by
              </span>
              <br />
              <span className="text-foreground">Solving Real Problems</span>
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Decentralized task marketplace on{' '}
            <span className="font-semibold text-secondary">Stellar blockchain</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex items-center justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <BountyButton variant="primary" size="lg" className="shadow-xl" onClick={() => window.location.hash = '#create'}>
              <TrendingUp size={24} />
              Create Bounty
            </BountyButton>
            <BountyButton variant="secondary" size="lg" onClick={() => window.location.hash = '#browse'}>
              Browse Bounties
            </BountyButton>
          </motion.div>

          {/* Decorative Line */}
          <motion.div
            className="w-32 h-1 mx-auto bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 128, opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          />
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6 pb-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="bg-card/80 backdrop-blur-xl border-2 border-border/50 rounded-2xl shadow-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
