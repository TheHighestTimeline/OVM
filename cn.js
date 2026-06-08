import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustIndicators = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'Enterprise Security',
      description: 'Bank-level encryption for all communications'
    },
    {
      icon: 'Lock',
      title: 'HIPAA Compliant',
      description: 'Meets healthcare privacy standards'
    },
    {
      icon: 'CheckCircle',
      title: 'Legal Industry Certified',
      description: 'Approved for attorney-client communications'
    }
  ];

  const certifications = [
    {
      name: 'SOC 2 Type II',
      icon: 'Award',
      color: 'text-success'
    },
    {
      name: 'ISO 27001',
      icon: 'Certificate',
      color: 'text-primary'
    },
    {
      name: 'ABA Approved',
      icon: 'Scale',
      color: 'text-warning'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {securityFeatures.map((feature, index) => (
          <div key={index} className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name={feature.icon} size={24} className="text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              {feature.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-center space-x-8">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Icon name={cert.icon} size={16} className={cert.color} />
              <span className="text-xs font-medium text-muted-foreground">
                {cert.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          This system is designed for professional legal communications and maintains\n
          strict confidentiality standards. All translations are processed securely\n
          and comply with attorney-client privilege requirements.
        </p>
      </div>
    </div>
  );
};

export default TrustIndicators;