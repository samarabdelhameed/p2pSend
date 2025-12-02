"""
حل مسائل البرمجة الخطية بطريقة Simplex
Linear Programming Solver using Simplex Method
"""

import numpy as np
from scipy.optimize import linprog
import sys


class SimplexSolver:
    """
    حل مسائل البرمجة الخطية بطريقة Simplex
    """
    
    def __init__(self, c, A_ub=None, b_ub=None, A_eq=None, b_eq=None, bounds=None):
        """
        تهيئة المسألة
        
        Parameters:
        -----------
        c : array
            معاملات دالة الهدف (Objective function coefficients)
        A_ub : array, optional
            مصفوفة قيود عدم المساواة (Inequality constraints matrix)
        b_ub : array, optional
            القيم الثابتة لقيود عدم المساواة
        A_eq : array, optional
            مصفوفة قيود المساواة (Equality constraints matrix)
        b_eq : array, optional
            القيم الثابتة لقيود المساواة
        bounds : tuple or list, optional
            حدود المتغيرات (bounds for variables)
        """
        self.c = np.array(c)
        self.A_ub = np.array(A_ub) if A_ub is not None else None
        self.b_ub = np.array(b_ub) if b_ub is not None else None
        self.A_eq = np.array(A_eq) if A_eq is not None else None
        self.b_eq = np.array(b_eq) if b_eq is not None else None
        self.bounds = bounds
        
    def solve(self, method='highs', maximize=False):
        """
        حل المسألة
        
        Parameters:
        -----------
        method : str
            طريقة الحل ('highs', 'simplex', 'interior-point')
        maximize : bool
            True إذا كانت المسألة تعظيم، False إذا كانت تصغير
            
        Returns:
        --------
        dict : نتائج الحل
        """
        # إذا كانت المسألة تعظيم، نحولها لتصغير
        c = self.c.copy()
        if maximize:
            c = -c
        
        # حل المسألة
        result = linprog(
            c=c,
            A_ub=self.A_ub,
            b_ub=self.b_ub,
            A_eq=self.A_eq,
            b_eq=self.b_eq,
            bounds=self.bounds,
            method=method
        )
        
        # إعداد النتائج
        solution = {
            'success': result.success,
            'message': result.message,
            'x': result.x,
            'fun': -result.fun if maximize else result.fun,  # قيمة دالة الهدف
            'status': result.status
        }
        
        return solution
    
    def print_solution(self, solution):
        """
        طباعة الحل بشكل منسق
        """
        print("\n" + "="*60)
        print("نتائج الحل بطريقة Simplex")
        print("="*60)
        
        if solution['success']:
            print(f"\n✅ الحل الأمثل موجود!")
            print(f"\nقيمة دالة الهدف: {solution['fun']:.4f}")
            print(f"\nقيم المتغيرات:")
            for i, val in enumerate(solution['x']):
                print(f"  x{i+1} = {val:.4f}")
        else:
            print(f"\n❌ {solution['message']}")
        
        print("="*60 + "\n")
        
        return solution


def solve_example():
    """
    مثال على حل مسألة برمجة خطية
    """
    print("\nمثال: حل مسألة برمجة خطية")
    print("-" * 60)
    
    # مثال: تعظيم Z = 3x1 + 2x2
    # تحت القيود:
    #   x1 + x2 <= 4
    #   2x1 + x2 <= 6
    #   x1, x2 >= 0
    
    print("\nالمسألة:")
    print("تعظيم Z = 3x₁ + 2x₂")
    print("تحت القيود:")
    print("  x₁ + x₂ ≤ 4")
    print("  2x₁ + x₂ ≤ 6")
    print("  x₁, x₂ ≥ 0")
    
    # معاملات دالة الهدف
    c = [3, 2]
    
    # قيود عدم المساواة
    A_ub = [
        [1, 1],   # x1 + x2 <= 4
        [2, 1]    # 2x1 + x2 <= 6
    ]
    b_ub = [4, 6]
    
    # حدود المتغيرات (x1 >= 0, x2 >= 0)
    bounds = [(0, None), (0, None)]
    
    # إنشاء الحل
    solver = SimplexSolver(c=c, A_ub=A_ub, b_ub=b_ub, bounds=bounds)
    solution = solver.solve(maximize=True)
    solver.print_solution(solution)
    
    return solution


if __name__ == "__main__":
    solve_example()

