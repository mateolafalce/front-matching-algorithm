import './Teoria.css';

const Teoria = () => {
  return (
    <div className="teoria-container">
      <h1>Algoritmo matcheo</h1>
      
      <p>
        Dados 2 usuarios, <em>i</em> y <em>j</em>, con sus respectivos preferencias (dias, horarios, canchas, categoria) 
        e historial de juego entre si, podemos diseñar una funcion la cual nos permita determinar cuales son las top <em>x</em> opciones 
        a recomendar al usuario que reserva una cancha para jugar en un dia y hora dados. Analiticamente puedo decir:
      </p>

      <p>
        Dada una lista ordenada, donde los valores en V estan de forma descendente. Llamare a esa lista ordenada
      </p>

      <div className="formula">
        V′: V′ = (v₁, v₂, v₃, ... , vₙ)
      </div>

      <p>Donde</p>

      <div className="formula">
        v₁ ≥ v₂ ≥ v₃ ≥ ... ≥ vₙ
      </div>

      <p>Con N pares (i,j).</p>

      <div className="formula-block">
        P<sub>topx</sub> = {'{'}(i,j) ∈ P | A(i,j) ≥ v<sub>topx</sub>{'}'}
      </div>

      <p>Donde:</p>
      <p>
        P<sub>topx</sub> es el conjunto resultado que contiene los pares (i,j) que generan los x valores más altos.
      </p>
      <p>
      P es el conjunto de todos los posibles pares (i,j).
      </p>
      <p>
        v<sub>topx</sub> es el x-ésimo valor más grande de la función A(i,j) después de ordenarlos todos.
      </p>
      <div className="formula-block">
        A(i,j) = α × S(i,j) + β × J(i,j)
      </div>

      <p>Donde:</p>
      <p>
            S(i,j) = 1 - d(i,j)/d<sub>max</sub> es la similitud de preferencias, con d(i,j) una distancia euclidiana 
            entre las preferencias de usuario <em>i</em> y <em>j</em>, y d<sub>max</sub> la distancia máxima posible 
            (normalizando S entre 0 y 1). En nuestro caso, tendremos que calcular modulos en espacios 4 dimensiones 
            (dias, horarios, canchas, categoria).
      </p>
          <p>
            J(i,j) = g(i,j)/g(i), donde la funcion g(i, j) nos indica la cantidad de partidos del usuario <em>i</em> con 
            el usuario <em>j</em>, y g(i) nos indica la totalidad de los partidos jugados por el usuario <em>i</em>
          </p>
          <p>
            α y β son pesos que balancean la importancia de las preferencias versus la historia de haber jugado juntos, 
            por lo tanto:
          </p>

      <div className="formula-block">
        α + β = 1
      </div>

      <p>
        Con esta fórmula, se puede calcular el puntaje A para cada par de usuarios, y luego obtener un top <em>x</em> de 
        usuarios con puntajes más altos para un usuario dado. Este puntaje se puede graficar como matriz de calor o top 
        ranking para visualizar semejanzas y relaciones.
      </p>

      <p>
        Partiremos del supuesto que jugar con un jugador o valorar mas las preferencias de dias y horarios es igual, 
        entiendase:
      </p>

      <div className="formula-block">
        α = β = 0.5
      </div>

      <h2>Aprendizaje Inteligente</h2>

      <p>
        Como no queremos suponer nada sino aprender de las reservas del usuario, vamos a proponer un algoritmo de 
        aprendizaje inteligente, incorporarando un mecanismo basado en <strong>backpropagation</strong> para ajustar 
        los pesos α y β de modo que la función A(i,j) refleje mejor cómo impacta las preferencias y el historial de 
        juego en la predicción del emparejamiento.
      </p>

      <p>
        Para hacerlo, usaremos un modelo simple de predicción supervisado, para minimizar un error con respecto a datos 
        reales de emparejamientos (si el usuario <em>i</em> eligió jugar con <em>j</em>, o no).
      </p>

      <p>
        Suponiendo que elegimos <em>x</em> pares (i,j) con etiquetas y<sub>ij</sub> ∈ {'{'}0,1{'}'}. 
        Donde (1 = jugaron, 0 = no jugaron).
      </p>

      <p>Podemos definir una función de pérdida L, con el error cuadrático medio:</p>

      <div className="formula-block">
        L(β) = Σ<sub>(i,j)</sub> (A(i,j) - y<sub>ij</sub>)² = Σ<sub>(i,j)</sub> ((1-β) S(i,j) + β J(i,j) - y<sub>ij</sub>)²
      </div>

      <p>El objetivo es minimizar L respecto a β (y α = 1 - β).</p>

      <h3>¿Por que optimizar β?</h3>

      <p>
        Se optimiza este peso ya que el unico dato "verdadero" {'{'}0,1{'}'} que tenemos. Una vez que se concreta la 
        reserva queda registrado en la BD si efectivamente <em>j</em> jugo con <em>i</em>.
      </p>

      <h3>Gradiente y actualización de pesos (backpropagation)</h3>

      <p>Derivamos L respecto a β:</p>

      <div className="formula-block">
        ∂L/∂β = 2 Σ<sub>(i,j)</sub> ((1-β) S(i,j) + β J(i,j) - y<sub>ij</sub>) (S(i,j) - J(i,j))
      </div>

      <p>Luego, actualizamos β con un learning rate η:</p>

      <div className="formula-block">
        β ← β - η ∂L/∂β
      </div>

      <p>Y finalmente hacemos lo mismo con α = 1 - β.</p>

      <div className="references">
        <p>
          Este algoritmo esta inspirado en{' '}
          <a href="https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm" target="_blank" rel="noopener noreferrer">
            k-nearest neighbors algorithm
          </a>{' '}
          y en{' '}
          <a href="https://en.wikipedia.org/wiki/Backpropagation" target="_blank" rel="noopener noreferrer">
            backpropagation
          </a>.
        </p>
      </div>
    </div>
  );
};

export default Teoria;